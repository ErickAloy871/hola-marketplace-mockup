import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../lib/jwt.js";

// Extender Request para incluir usuario
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
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.substring(7);
    const payload = verifyJwt(token);
    
    // Extraer roles del payload
    const roles = payload.rol ? payload.rol.split(",") : [];
    
    req.user = {
      id: payload.sub,
      roles: roles
    };
    
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

/**
 * Middleware para verificar que el usuario NO sea MODERADOR
 * (para bloquear a moderadores de crear publicaciones)
 */
export const blockModerator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.roles.includes("MODERADOR")) {
    return res.status(403).json({ 
      message: "Los moderadores no pueden crear publicaciones" 
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea MODERADOR
 */
export const requireModerator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (!req.user.roles.includes("MODERADOR")) {
    return res.status(403).json({ 
      message: "Acceso denegado. Solo moderadores" 
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea ADMINISTRADOR
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (!req.user.roles.includes("ADMINISTRADOR")) {
    return res.status(403).json({ 
      message: "Acceso denegado. Solo administradores" 
    });
  }

  next();
};
