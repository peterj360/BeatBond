import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token) {
            return res.status(403).json({ message: "Access denied: No token provided"});
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Access denied: Token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: `Access denied: ${error.message}` });
        }
        res.status(500).json({message: error.message});
    }
};

export default verifyToken;