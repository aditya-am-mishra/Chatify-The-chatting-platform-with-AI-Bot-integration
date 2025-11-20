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

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://chatify-the-chatting-platform-with.vercel.app'
];

if (ENV.CLIENT_URL) {
  allowedOrigins.push(ENV.CLIENT_URL);
}

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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
