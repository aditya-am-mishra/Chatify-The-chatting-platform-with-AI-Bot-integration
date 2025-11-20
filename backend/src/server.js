import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiBotRoutes from "./routes/aiBot.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" }));

// Simplified CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://chatify-the-chatting-platform-with.vercel.app',
  ENV.CLIENT_URL
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins); // Debug log

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin); // Debug log
      callback(null, false); // ← Fixed: don't throw error, just return false
    }
  },
  credentials: true 
}));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiBotRoutes);

// Production static serving
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  
  // Only serve if frontend build exists
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    app.get("*", (_, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
