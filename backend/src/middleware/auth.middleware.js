import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../lib/env.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ msg: "Unauthorized - No token provided" });

        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(404).json({ msg: "User Not Found!" });

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: "Unauthorized - Invalid or expired token" });
        }
        console.error("Error in protectRoute Middleware:", error);
        res.status(500).json({ msg: "Internal Server Error!" });
    }
};

export default protectRoute;
