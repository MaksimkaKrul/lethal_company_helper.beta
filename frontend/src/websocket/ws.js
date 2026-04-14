import { WS_BASE } from "../config";

let _socket = null;
let _listeners = new Set();
let _reconnectAttempts = 0;
let _reconnectTimeout = null;
let _messageQueue = [];
let _currentRoomId = null;

export const WebSocketService = {
  connect(roomId) {
    if (_socket && _socket.readyState <= 1) return;

    _currentRoomId = roomId;
    clearTimeout(_reconnectTimeout);

    _socket = new WebSocket(`${WS_BASE}/ws/rooms/${roomId}/`);

    _socket.onopen = () => {
      _reconnectAttempts = 0;
      while (_messageQueue.length > 0 && _socket?.readyState === WebSocket.OPEN) {
        this.send(_messageQueue.shift());
      }
    };

    _socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        _listeners.forEach(listener => listener(data));
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    _socket.onclose = () => {
      _socket = null;
      clearTimeout(_reconnectTimeout);
      
      if (!_currentRoomId) return;

      const delay = Math.min(1000 * Math.pow(2, _reconnectAttempts), 30000);
      _reconnectTimeout = setTimeout(() => {
        _reconnectAttempts++;
        this.connect(_currentRoomId);
      }, delay);
    };

    _socket.onerror = () => _socket?.close();

    if (!window._wsUnloadBound) {
      window.addEventListener("beforeunload", () => this.disconnect());
      window._wsUnloadBound = true;
    }
  },

  subscribe(callback) {
    if (typeof callback !== "function") return () => {};
    
    if (_listeners.size > 50) {
      console.warn("High WS listener count detected");
    }
    _listeners.add(callback);
    return () => _listeners.delete(callback);
  },

  send(payload) {
    if (_socket?.readyState === WebSocket.OPEN) {
      _socket.send(JSON.stringify(payload));
    } else {
      if (_messageQueue.length > 100) _messageQueue.shift();
      _messageQueue.push(payload);
    }
  },

  disconnect() {
    _currentRoomId = null;
    clearTimeout(_reconnectTimeout);
    _messageQueue = [];
    if (_socket) {
      _socket.onclose = null;
      _socket.close();
      _socket = null;
    }
    _listeners.clear();
  }
};