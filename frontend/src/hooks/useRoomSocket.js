import { useEffect, useState, useRef, useCallback } from "react";
import { WebSocketClient, WebSocketStatus } from "../websocket/ws";

export function useRoomSocket(roomId) {
  const [status, setStatus] = useState(WebSocketStatus.CONNECTING);
  const [data, setData] = useState({ players: [], quotas: [], museum: [] });
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new WebSocketClient(roomId);
    clientRef.current = client;

    const unsubStatus = client.onStatusChange(setStatus);
    const unsubData = client.subscribe((msg) => {
      if (msg.type === "UPDATE_PLAYERS") setData(prev => ({ ...prev, players: msg.players }));
      if (msg.type === "UPDATE_QUOTAS") setData(prev => ({ ...prev, quotas: msg.content }));
      if (msg.type === "UPDATE_MUSEUM") setData(prev => ({ ...prev, museum: msg.content }));
    });

    client.connect();

    return () => client.destroy();
  }, [roomId]);

  const send = useCallback((payload) => {
    clientRef.current?.send(payload);
  }, []);

  return { status, ...data, send };
}