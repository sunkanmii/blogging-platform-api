import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
        if(error){
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    })
}

export default authenticateToken;