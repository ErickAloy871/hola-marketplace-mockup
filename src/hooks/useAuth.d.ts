interface User {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    roles?: string[];
}
export declare const useAuth: () => {
    user: User;
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => void;
};
export {};
