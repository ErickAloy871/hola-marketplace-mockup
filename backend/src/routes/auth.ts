import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { sign, verifyJwt, JWTPayload } from "../lib/jwt.js";
import type { RowDataPacket } from "mysql2";

type UserRow = RowDataPacket & {
  id: string; rolId: string; nombre: string; apellido: string;
  correo: string; passwordHash: string | null;
};

const r = Router();

r.post("/login", async (req: Request, res: Response) => {
  const { correo, password } = req.body as { correo: string; password: string };

  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, rolId, nombre, apellido, correo, passwordHash FROM USUARIOS WHERE correo=? LIMIT 1",
    [correo]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  const hash = user.passwordHash ?? "";
  const ok = hash.startsWith("$2a$") || hash.startsWith("$2b$")
    ? await bcrypt.compare(password, hash)
    : password === hash;

  if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

  const token = sign({ sub: user.id, rol: user.rolId });
  // removed ultimoLogin update for compatibility with current schema

  res.json({ token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo } });
});

r.post("/register", async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, correo, password, telefono, direccion } = req.body as {
      nombre: string; apellido: string; correo: string; password: string;
      telefono: string; direccion: string;
    };

    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.query<UserRow[]>(
      "SELECT id FROM USUARIOS WHERE correo=? LIMIT 1",
      [correo]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const [result] = await pool.query(
      "INSERT INTO USUARIOS (nombre, apellido, correo, passwordHash, telefono, direccion, rolId) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido, correo, passwordHash, telefono, direccion, "2"] // rolId 2 = comprador por defecto
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Generar token
    const token = sign({ sub: userId.toString(), rol: "2" });

    res.status(201).json({
      token,
      user: { id: userId, nombre, apellido, correo }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

r.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    console.log("Auth header:", authHeader);
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Token:", token.substring(0, 20) + "...");
    
    const payload = verifyJwt(token) as JWTPayload;
    console.log("Payload:", payload);

    const [rows] = await pool.query<(RowDataPacket & { id: string; nombre: string; apellido: string; correo: string })[]>(
      "SELECT id, nombre, apellido, correo FROM USUARIOS WHERE id=? LIMIT 1",
      [payload.sub]
    );
    console.log("User found:", rows[0]);
    res.json(rows[0] ?? null);
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "No autorizado" });
  }
});

export default r;
