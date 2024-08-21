import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET_KEY, { "expiresIn": "1h" });
}

export const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET_KEY, { "expiresIn": "7d" });
}