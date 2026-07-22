import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
    try {
        const { MONGO_URL } = ENV;
        if (!MONGO_URL) throw new Error("MONGO_URL is not set");

        const conn = await mongoose.connect(MONGO_URL);
        if (ENV.NODE_ENV !== "production") {
            console.log("MongoDB connected:", conn.connection.host);
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};
