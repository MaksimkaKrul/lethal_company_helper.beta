export const API_BASE = import.meta.env.VITE_API_URL || "";
export const WS_BASE = API_BASE ? API_BASE.replace(/^http/, 'ws') : `ws://${window.location.host}`;

export const UI_CONFIG = {
    RECONNECT_DELAY: 3000,
    INITIAL_QUOTA: 130
};