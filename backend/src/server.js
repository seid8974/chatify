// Chatify API Server
import "dotenv/config";
import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import { app, server } from './lib/socket.js';

const PORT = ENV.PORT || 5000;

app.use(express.json({ limit: "5mb" }));
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (_, res) => {
    res.send('Welcome to the Chatify API!');
});

// connect to DB first, then start server
connectDB().then(() => {
    server.listen(PORT, () => {
        if (ENV.NODE_ENV !== "production") {
            console.log("Server is running on port " + PORT);
        }
    });
});
