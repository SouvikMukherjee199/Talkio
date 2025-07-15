import express from 'express';
import dotenv from 'dotenv'; 

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

import path from "path";

import { connectDB } from './lib/db.js';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import {app, server} from "./lib/socket.js"

dotenv.config();



// const app = express();

const PORT = process.env.PORT ;
const __dirname = path.resolve();

// Middleware to parse JSON bodies
// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Enabling Express server to handle larger files greater than default 100KB
app.use(cookieParser());
// CORS configuration
app.use(cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // Allow cookies to be sent
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist"))); //making the dist from frontend as a static asset for production
    
    app.get("*", (req, res)=> {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});