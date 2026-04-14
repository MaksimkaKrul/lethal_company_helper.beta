import { API_BASE } from "../config";

const DEFAULT_TIMEOUT = 8000;

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
    
    const config = {
        credentials: "include",
        ...options,
        signal: controller.signal,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    };

    if (config.body && typeof config.body === "object") {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        if (response.status === 204) return null;

        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }
        }

        if (!response.ok) {
            const errorMsg = data?.error || data?.detail || `Satellite Error: ${response.status}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error("Transmission timed out. Check your terminal connection.");
        }
        throw error;
    }
}

export const apiClient = {
    get: (url, options) => apiRequest(url, { ...options, method: "GET" }),
    post: (url, body, options) => apiRequest(url, { ...options, method: "POST", body }),
    patch: (url, body, options) => apiRequest(url, { ...options, method: "PATCH", body }),
    delete: (url, options) => apiRequest(url, { ...options, method: "DELETE" }),
};