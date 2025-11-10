import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                roles: string[];
            };
        }
    }
}
/**
 * Middleware para verificar el token JWT y extraer información del usuario
 */
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
/**
 * Middleware para verificar que el usuario NO sea MODERADOR
 * (para bloquear a moderadores de crear publicaciones)
 */
export declare const blockModerator: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
/**
 * Middleware para verificar que el usuario sea MODERADOR
 */
export declare const requireModerator: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
/**
 * Middleware para verificar que el usuario sea ADMINISTRADOR
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
