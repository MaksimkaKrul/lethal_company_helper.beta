import { WS_BASE } from "../config";

export const WebSocketStatus = {
  CONNECTING: "CONNECTING",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  FAILED: "FAILED"
};

export class WebSocketClient {
  constructor(roomId) {
    this.roomId = roomId;
    this.instanceId = Math.random().toString(36).substring(7);
    this.socket = null;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.status = WebSocketStatus.CLOSED;
    this.reconnectAttempts = 0;
    this.MAX_ATTEMPTS = 10;
    this.reconnectTimeout = null;
    this.messageQueue = [];
    this.isDestroyed = false;
    
    this.pingInterval = null;
    this.pongTimeout = null;
    this.PING_MS = 25000;
    this.PONG_WAIT_MS = 5000;
  }

  _log(message, data = {}) {
    console.log(`[WS][${this.instanceId}][Room:${this.roomId}] ${message}`, data);
  }

  _setStatus(newStatus) {
    if (this.isDestroyed) return;
    this.status = newStatus;
    this.statusListeners.forEach(fn => fn(newStatus));
  }

  connect() {
    if (this.isDestroyed) return;
    if (this.reconnectAttempts >= this.MAX_ATTEMPTS) {
      this._setStatus(WebSocketStatus.FAILED);
      this._log("Max reconnect attempts reached.");
      return;
    }

    this._setStatus(WebSocketStatus.CONNECTING);
    this._clearTimers();

    try {
      this.socket = new WebSocket(`${WS_BASE}/ws/rooms/${this.roomId}/`);

      this.socket.onopen = () => {
        if (this.isDestroyed) { this.socket.close(); return; }
        this._log("Connection established");
        this.reconnectAttempts = 0;
        this._setStatus(WebSocketStatus.OPEN);
        this._startHeartbeat();
        
        while (this.messageQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
          const payload = this.messageQueue.shift();
          this.send(payload);
        }
      };

      this.socket.onmessage = (event) => {
        if (this.isDestroyed) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "PONG") {
            this._handlePong();
            return;
          }
          this.listeners.forEach(fn => fn(data));
        } catch (e) {
          this._log("Protocol Error: invalid JSON");
        }
      };

      this.socket.onclose = (event) => {
        this._stopHeartbeat();
        if (this.isDestroyed) return;

        this._setStatus(WebSocketStatus.CLOSED);
        const jitter = Math.random() * 1000;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts) + jitter, 30000);
        
        this._log(`Closed (code: ${event.code}). Retry #${this.reconnectAttempts + 1} in ${(delay/1000).toFixed(1)}s`);
        
        this.reconnectTimeout = setTimeout(() => {
          if (!this.isDestroyed) {
            this.reconnectAttempts++;
            this.connect();
          }
        }, delay);
      };

      this.socket.onerror = () => this.socket?.close();

    } catch (e) {
      this._setStatus(WebSocketStatus.CLOSED);
    }
  }

  send(payload) {
    if (this.isDestroyed) return;
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      const isDuplicate = this.messageQueue.some(m => m.type === payload.type);
      if (isDuplicate && payload.type.startsWith("UPDATE")) {
          this.messageQueue = this.messageQueue.filter(m => m.type !== payload.type);
      }
      if (this.messageQueue.length > 20) this.messageQueue.shift();
      this.messageQueue.push(payload);
      this._log("Message queued", { type: payload.type, queueSize: this.messageQueue.length });
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  destroy() {
    this.isDestroyed = true;
    this._log("Destroying instance");
    this._clearTimers();
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socket.close();
    }
    this.listeners.clear();
    this.statusListeners.clear();
    this.messageQueue = [];
  }

  _startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "PING" }));
        this.pongTimeout = setTimeout(() => {
          this._log("Heartbeat timeout. Closing.");
          this.socket?.close();
        }, this.PONG_WAIT_MS);
      }
    }, this.PING_MS);
  }

  _stopHeartbeat() {
    clearInterval(this.pingInterval);
    clearTimeout(this.pongTimeout);
  }

  _handlePong() {
    clearTimeout(this.pongTimeout);
  }

  _clearTimers() {
    clearTimeout(this.reconnectTimeout);
    this._stopHeartbeat();
  }
}