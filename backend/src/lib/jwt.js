import jwt from "jsonwebtoken";
var secret = process.env.JWT_SECRET;
export var sign = function (payload) {
    return jwt.sign(payload, secret, { expiresIn: "2d" });
};
export var verifyJwt = function (token) {
    try {
        return jwt.verify(token, secret);
    }
    catch (error) {
        console.error("JWT verification error:", error);
        throw new Error("Invalid token");
    }
};
