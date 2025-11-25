export function connectToRoom(roomId, onMessage) {
    const socket = new WebSocket(`ws://localhost:8000/ws/rooms/${roomId}/`);

    socket.onmessage = (event) => onMessage(JSON.parse(event.data));

    return socket;
}
