import { Request, Response, NextFunction } from "express";

/**
 * PERMITIR acceso tanto a VENDEDORES como a COMPRADORES
 * para crear, editar, eliminar, gestionar fotos, etc.
 */
export const requireVendedor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  // PERMITIR AMBOS ROLES
  const roles = req.user.roles || [];

  if (!roles.includes("VENDEDOR") && !roles.includes("COMPRADOR")) {
    return res.status(403).json({
      message: "Acceso permitido solo a vendedores o compradores"
    });
  }

  next();
};
