import jwt from "jsonwebtoken";
import checkRefreshToken from "./checkRefreshToken.js";

// check if there is a valid acces token, if yes then call next(), else call checkRefreshToken middleware. 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No access token, so call checkRefreshToken
        return checkRefreshToken(req, res, next);
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
        if (error) {
            // If access token is invalid, call checkRefreshToken
            return checkRefreshToken(req, res, next);
        }
        req.user = user;
        next();
    })
}

export default authenticateToken;