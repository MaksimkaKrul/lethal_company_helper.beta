import { API_BASE } from "../config"

export async function createRoom(data) {
    const res = await fetch(`${API_BASE}/api/rooms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Обязательно
        body: JSON.stringify(data)
    });
    return res.json();
}