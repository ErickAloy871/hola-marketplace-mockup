const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const BACKEND_BASE = (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
    : "http://localhost:4000");

export async function api(path: string, opts: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(API + path, { ...opts, headers });

    // ✅ Leer respuesta como texto primero (evita consumir stream dos veces)
    if (!res.ok) {
        const text = await res.text();
        let errorData;

        try {
            errorData = JSON.parse(text);
        } catch {
            errorData = { message: text };
        }

        const error: any = new Error(errorData.message || 'Request failed');
        error.response = {
            status: res.status,
            statusText: res.statusText,
            data: errorData
        };
        throw error;
    }

    return res.json();
}
