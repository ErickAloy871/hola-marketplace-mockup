import jwt from "jsonwebtoken";

export interface JWTPayload extends jwt.JwtPayload {
  sub: string;
  rol?: string;
}

const secret = process.env.JWT_SECRET!;

export const sign = (payload: JWTPayload) =>
  jwt.sign(payload, secret, { expiresIn: "2d" });

export const verifyJwt = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    throw new Error("Invalid token");
  }
};
