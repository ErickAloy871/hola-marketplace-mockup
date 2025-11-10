import { verifyJwt } from "../lib/jwt.js";
/**
 * Middleware para verificar el token JWT y extraer información del usuario
 */
export var verifyToken = function (req, res, next) {
    try {
        var authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }
        var token = authHeader.substring(7);
        var payload = verifyJwt(token);
        // Extraer roles del payload
        var roles = payload.rol ? payload.rol.split(",") : [];
        req.user = {
            id: payload.sub,
            roles: roles
        };
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};
/**
 * Middleware para verificar que el usuario NO sea MODERADOR
 * (para bloquear a moderadores de crear publicaciones)
 */
export var blockModerator = function (req, res, next) {
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
export var requireModerator = function (req, res, next) {
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
export var requireAdmin = function (req, res, next) {
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
