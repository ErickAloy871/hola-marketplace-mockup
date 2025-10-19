import jwt from "jsonwebtoken";

export interface JWTPayload extends jwt.JwtPayload {
  sub: string;
  rol?: string;
}

const secret = process.env.JWT_SECRET!;

export const sign = (payload: JWTPayload) =>
  jwt.sign(payload, secret, { expiresIn: "2d" });

export const verifyJwt = (token: string): JWTPayload =>
  jwt.verify(token, secret) as JWTPayload;
