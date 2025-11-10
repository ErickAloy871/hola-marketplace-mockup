import jwt from "jsonwebtoken";
export interface JWTPayload extends jwt.JwtPayload {
    sub: string;
    rol?: string;
}
export declare const sign: (payload: JWTPayload) => string;
export declare const verifyJwt: (token: string) => JWTPayload;
