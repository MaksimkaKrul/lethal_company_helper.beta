const API_BASE = import.meta.env.VITE_API_URL || "";

export async function createRoom(data) {
    const res = await fetch(`${API_BASE}/api/rooms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
}