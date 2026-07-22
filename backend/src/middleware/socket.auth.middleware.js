import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../lib/env.js';

const socketAuthMiddleware = async (socket, next) => {
    try {
        // try auth token first, then parse cookie header properly
        let token = socket.handshake.auth?.token;

        if (!token) {
            const cookieHeader = socket.handshake.headers?.cookie || '';
            const match = cookieHeader.match(/(?:^|;\s*)jwt=([^;]+)/);
            token = match?.[1];
        }

        if (!token) return next(new Error("Unauthorized - No token provided"));

        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return next(new Error("Unauthorized - User not found"));

        socket.userId = user._id.toString();
        socket.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(new Error("Unauthorized - Invalid or expired token"));
        }
        next(new Error("Unauthorized"));
    }
};

export default socketAuthMiddleware;
