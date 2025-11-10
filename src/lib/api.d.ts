export declare const BACKEND_BASE: string;
export declare function api(path: string, opts?: RequestInit): Promise<any>;
export declare const authApi: {
    login: (correo: string, password: string) => Promise<any>;
    register: (nombre: string, apellido: string, correo: string, password: string, telefono: string, direccion: string) => Promise<any>;
    me: () => Promise<any>;
};
export declare const productosApi: {
    getAll: (params?: {
        q?: string;
        categoria?: string;
        minPrecio?: number;
        maxPrecio?: number;
        page?: number;
        pageSize?: number;
    }) => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (productoData: {
        nombre: string;
        descripcion: string;
        precio: number;
        ubicacion: string;
        categoriaId: number;
    }) => Promise<any>;
};
export declare const moderationApi: {
    getPending: () => Promise<any>;
    approve: (id: number) => Promise<any>;
    reject: (id: number, motivo?: string) => Promise<any>;
    getStats: () => Promise<any>;
    getAllModeration: () => Promise<any>;
    darDeBaja: (id: number, motivo?: string) => Promise<any>;
    getCategories: () => Promise<any>;
};
