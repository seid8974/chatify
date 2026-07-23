// Chatify API Server
import "dotenv/config";
import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';

const PORT = ENV.PORT || 5000;

// Defer importing socket.js and the route files until after dotenv/config
// has fully executed and connectDB() has run. socket.js -> socketAuthMiddleware
// -> user model, and the auth/message routes, eventually pull in the arcjet
// middleware, which reads env vars and initializes crypto internally. Loading
// those modules eagerly at the top of this file races with dotenv's
// initialization and can crash with "crypto is not defined". Using dynamic
// import() here guarantees env variables and crypto are ready first.
connectDB().then(async () => {
    const { app, server } = await import('./lib/socket.js');
    const { default: authRoutes } = await import('./routes/auth.route.js');
    const { default: messageRoutes } = await import('./routes/message.route.js');

    app.use(express.json({ limit: "5mb" }));
    app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
    app.use(cookieParser());

    app.use('/api/auth', authRoutes);
    app.use('/api/messages', messageRoutes);

    app.get('/', (_, res) => {
        res.send('Welcome to the Chatify API!');
    });

    server.listen(PORT, () => {
        if (ENV.NODE_ENV !== "production") {
            console.log("Server is running on port " + PORT);
        }
    });
});
