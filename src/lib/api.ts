const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type":"application/json", ...(token? { Authorization:`Bearer ${token}` }:{}) };
  const res = await fetch(API + path, { ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Funciones específicas para la API
export const authApi = {
  login: async (correo: string, password: string) => {
    return api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password })
    });
  },
  
  register: async (nombre: string, apellido: string, correo: string, password: string, telefono: string, direccion: string) => {
    return api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombre, apellido, correo, password, telefono, direccion })
    });
  },
  
  me: async () => {
    return api("/auth/me");
  }
};

export const productosApi = {
  getAll: async (params?: { q?: string; categoria?: string; minPrecio?: number; maxPrecio?: number; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    const query = searchParams.toString();
    return api(`/productos${query ? `?${query}` : ""}`);
  },
  
  getById: async (id: string) => {
    return api(`/productos/${id}`);
  }
};
