import { create } from 'zustand';
import { WebSocketClient, WebSocketStatus } from '../websocket/ws';
import { RoomCommands } from '../websocket/commands';

export const useRoomStore = create((set, get) => ({
    status: WebSocketStatus.CLOSED,
    players: [],
    quotas: [],
    museum: [],
    client: null,

    connect: (roomId) => {
        const client = new WebSocketClient(roomId);
        
        client.onStatusChange((status) => set({ status }));
        
        client.subscribe((msg) => {
            if (msg.type === "UPDATE_PLAYERS") set({ players: msg.players });
            if (msg.type === "UPDATE_QUOTAS") set({ quotas: msg.content });
            if (msg.type === "UPDATE_MUSEUM") set({ museum: msg.content });
        });

        client.connect();
        set({ client });
    },

    disconnect: () => {
        const { client } = get();
        if (client) {
            client.destroy();
            set({ client: null, status: WebSocketStatus.CLOSED });
        }
    },

    updateQuotas: (newQuotas) => {
        set({ quotas: newQuotas });
        const { client } = get();
        if (client) {
            client.send(RoomCommands.updateQuotas(newQuotas));
        }
    },

    updateMuseum: (newItems) => {
        set({ museum: newItems });
        const { client } = get();
        if (client) {
            client.send(RoomCommands.updateMuseum(newItems));
        }
    },

    setEmoji: (emoji) => {
        const { client } = get();
        if (client) {
            client.send(RoomCommands.setEmoji(emoji));
        }
    }
}));