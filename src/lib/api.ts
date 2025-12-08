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

  // ✅ Si hay error, parseamos el JSON y lanzamos error con estructura similar a axios
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
export async function apiUpload(path: string, formData: FormData) {
  const token = localStorage.getItem("token");

  const res = await fetch(API + path, {
    method: "POST",
    body: formData,   // 👈 sin headers JSON
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const authApi = {
  login: async (correo: string, password: string) => {
    return api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password }),
    });
  },

  register: async (
    nombre: string,
    apellido: string,
    correo: string,
    password: string,
    telefono: string,
    direccion: string
  ) => {
    return api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        nombre,
        apellido,
        correo,
        password,
        telefono,
        direccion,
      }),
    });
  },

  me: async () => {
    return api("/auth/me");
  },
};

export const productosApi = {
  getAll: async (params?: {
    q?: string;
    categoria?: string;
    tipo?: string;
    minPrecio?: number;
    maxPrecio?: number;
    ordenar?: string;
    page?: number;
    pageSize?: number;
  }) => {
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

  create: async (productoData: {
    nombre: string;
    descripcion: string;
    precio: number;
    ubicacion: string;
    categoriaId: number;
    tipo: "PRODUCTO" | "SERVICIO";
  }) => {
    return api("/productos", {
      method: "POST",
      body: JSON.stringify(productoData),
    });
  },
};

export const moderationApi = {
  getPending: async () => {
    return api("/moderation/pending");
  },

  approve: async (id: number) => {
    return api(`/moderation/approve/${id}`, {
      method: "POST",
    });
  },

  reject: async (id: number, motivo?: string) => {
    return api(`/moderation/reject/${id}`, {
      method: "POST",
      body: JSON.stringify({ motivo }),
    });
  },

  getStats: async () => {
    return api("/moderation/stats");
  },

  getAllModeration: async () => {
    return api("/moderation/publicaciones-moderacion");
  },

  darDeBaja: async (id: number, motivo?: string) => {
    return api(`/moderation/dar-baja/${id}`, {
      method: "POST",
      body: JSON.stringify({ motivo }),
    });
  },

  getCategories: async () => {
    return api("/productos/categorias");
  },
};

export const reportesApi = {
  create: async (publicacionId: number, categoria: string, motivo?: string) => {
    return api("/reportes", {
      method: "POST",
      body: JSON.stringify({ publicacionId, categoria, motivo }),
    });
  },

  getAll: async () => {
    return api("/reportes");
  },

  marcarRevisado: async (id: number) => {
    return api(`/reportes/${id}/revisar`, {
      method: "POST",
    });
  },

  eliminar: async (id: number) => {
    return api(`/reportes/${id}`, {
      method: "DELETE",
    });
  },

  eliminarPublicacion: async (id: number) => {
    return api(`/reportes/${id}/eliminar-publicacion`, {
      method: "POST",
    });
  },
};

// ✅ NUEVO: API de productos de interés
export const interesesApi = {
  agregar: async (publicacionId: number) => {
    return api("/intereses", {
      method: "POST",
      body: JSON.stringify({ publicacionId }),
    });
  },

  eliminar: async (publicacionId: number) => {
    return api(`/intereses/${publicacionId}`, {
      method: "DELETE",
    });
  },

  obtenerTodos: async () => {
    return api("/intereses");
  },

  verificar: async (publicacionId: number) => {
    return api(`/intereses/check/${publicacionId}`);
  },
};

// ✅ NUEVO: API de chat
export const chatApi = {
  // Lista de conversaciones del usuario actual
  getConversaciones: async () => {
    return api("/chat/conversaciones");
  },

  // Crear u obtener conversación con otro usuario
  crearConversacionConUsuario: async (otroUsuarioId: number) => {
    return api("/chat/conversaciones", {
      method: "POST",
      body: JSON.stringify({ otroUsuarioId }),
    });
  },

  // Crear u obtener conversación a partir de una publicación
  crearConversacionDesdePublicacion: async (publicacionId: number) => {
    return api("/chat/conversaciones", {
      method: "POST",
      body: JSON.stringify({ publicacionId }),
    });
  },

  // Obtener mensajes de una conversación
  getMensajes: async (conversacionId: number) => {
    return api(`/chat/conversaciones/${conversacionId}/mensajes`);
  },

  // Enviar mensaje
  enviarMensaje: async (conversacionId: number, contenido: string) => {
    return api("/chat/mensajes", {
      method: "POST",
      body: JSON.stringify({ conversacionId, contenido }),
    });
  },

  // Buscar usuarios para iniciar chat
  buscarUsuarios: async (q: string) => {
    const params = new URLSearchParams({ q });
    return api(`/chat/usuarios?${params.toString()}`);
  },
};
