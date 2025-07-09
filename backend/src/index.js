import express from 'express';
import dotenv from 'dotenv'; 

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

import { connectDB } from './lib/db.js';

import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();

const PORT = process.env.PORT ;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
// CORS configuration
app.use(cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // Allow cookies to be sent
}));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});