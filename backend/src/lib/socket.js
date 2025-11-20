import { Server } from "socket.io";
import express from "express";
import http from "http";
import { ENV } from "./env.js";

const app = express();
const server = http.createServer(app);

// Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow localhost and any vercel.app domain
      if (!origin || 
          origin.startsWith('http://localhost') || 
          origin.endsWith('.vercel.app') ||
          origin === ENV.CLIENT_URL) {
        callback(null, true);
      } else {
        console.log('Socket.io blocked origin:', origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Socket authentication and events
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error("Not authenticated"));
  }
  socket.userId = userId;
  next();
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.userId);
  userSocketMap[socket.userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.userId);
    delete userSocketMap[socket.userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
