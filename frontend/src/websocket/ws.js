export function connectToRoom(roomId, onMessage) {
    const API_BASE = import.meta.env.VITE_API_URL || "";
    let ws_url;

    if (API_BASE) {
        // Если есть VITE_API_URL (прод), меняем http(s) на ws(s)
        ws_url = API_BASE.replace(/^http/, 'ws');
    } else {
        // Локалка
        ws_url = `ws://${window.location.host}`;
    }

    const socket = new WebSocket(`${ws_url}/ws/rooms/${roomId}/`);

    socket.onmessage = (event) => onMessage(JSON.parse(event.data));

    return socket;
}