export const RoomCommands = {
    updateQuotas: (quotas) => ({ type: "UPDATE_QUOTAS", content: quotas }),
    updateMuseum: (items) => ({ type: "UPDATE_MUSEUM", content: items }),
    setEmoji: (emoji) => ({ type: "SET_EMOJI", emoji }),
};