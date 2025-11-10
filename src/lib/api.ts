const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// URL base del backend (sin el sufijo /api). Usar la variable VITE_API_URL si está definida.
export const BACKEND_BASE = (import.meta.env.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
  : "http://localhost:4000");

export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
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
  },

  // ✅ NUEVO: Crear producto
  create: async (productoData: {
    nombre: string;
    descripcion: string;
    precio: number;
    ubicacion: string;
    categoriaId: number;
  }) => {
    return api("/productos", {
      method: "POST",
      body: JSON.stringify(productoData)
    });
  }
};

// ✅ NUEVO: API de moderación
export const moderationApi = {
  getPending: async () => {
    return api("/moderation/pending");
  },

  approve: async (id: number) => {
    return api(`/moderation/approve/${id}`, {
      method: "POST"
    });
  },

  reject: async (id: number, motivo?: string) => {
    return api(`/moderation/reject/${id}`, {
      method: "POST",
      body: JSON.stringify({ motivo })
    });
  },

  getStats: async () => {
    return api("/moderation/stats");
  },

  // ✅ AGREGADO: Obtener todas las publicaciones pendientes/publicadas (para el panel)
  getAllModeration: async () => {
    return api("/moderation/publicaciones-moderacion");
  },

  // ✅ AGREGADO: Dar de baja producto (pendiente o publicado)
  darDeBaja: async (id: number, motivo?: string) => {
    return api(`/moderation/dar-baja/${id}`, {
      method: "POST",
      body: JSON.stringify({ motivo })
    });
  },

  // Obtener categorías activas
  getCategories: async () => {
    // Las categorías están expuestas en el router de productos en el backend
    // en la ruta /api/productos/categorias, por eso solicitamos /productos/categorias
    return api("/productos/categorias");
  }
};
