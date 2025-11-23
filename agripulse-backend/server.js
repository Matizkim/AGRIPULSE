// server.js
import dotenv from "dotenv/config";
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
//import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";

import produceRoutes from "./src/routes/produce.js";
import demandRoutes from "./src/routes/demand.js";
import smsRoutes from "./src/routes/sms.js";
import matchRoutes from "./src/routes/match.js";

// Clerk middleware (new)
import { clerkMiddlewareAdapter } from "./src/utils/clerkVerify.js";

//dotenv.config();
console.log("Loaded AT_USERNAME:", process.env.AT_USERNAME);
console.log("Loaded AT_API_KEY:", process.env.AT_API_KEY ? "Yes" : "No");


const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: true, credentials: true },
});

const PORT = process.env.PORT || 5000;

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Clerk middleware must come BEFORE routes
// NOTE: Currently disabled for testing/development. 
// To enable authentication:
// 1. Ensure CLERK_SECRET_KEY is set in .env
// 2. Uncomment the line below
// 3. All routes using requireAuth() will then be protected
//app.use(clerkMiddlewareAdapter);

// Basic rate limit
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Routes
app.use("/api/produce", produceRoutes);
app.use("/api/demand", demandRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/match", matchRoutes);

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Socket.IO implementation
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`${socket.id} left ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Allow routes to use io if needed
app.set("io", io);

// Connect DB and start server
(async () => {
  await connectDB(process.env.MONGODB_URI);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  console.log("MONGO DB URI:", process.env.MONGODB_URI);
})();
