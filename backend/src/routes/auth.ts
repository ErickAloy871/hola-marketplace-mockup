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
  await pool.query("UPDATE USUARIOS SET ultimoLogin=NOW() WHERE id=?", [user.id]);

  res.json({ token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo } });
});

r.get("/me", async (req: Request, res: Response) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const payload = verifyJwt(token) as JWTPayload;

    const [rows] = await pool.query<(RowDataPacket & { id: string; nombre: string; apellido: string; correo: string })[]>(
      "SELECT id, nombre, apellido, correo FROM USUARIOS WHERE id=? LIMIT 1",
      [payload.sub]
    );
    res.json(rows[0] ?? null);
  } catch {
    res.status(401).json({ message: "No autorizado" });
  }
});

export default r;
