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
import messageRoutes from "./src/routes/messages.js";
import reviewRoutes from "./src/routes/reviews.js";
import transportRoutes from "./src/routes/transport.js";
import userRoutes from "./src/routes/users.js";
import matchingRoutes from "./src/routes/matching.js";

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
// Configure Helmet to work with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - supports multiple origins in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment or use defaults
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : process.env.NODE_ENV === 'production'
        ? [] // In production, require CORS_ORIGIN to be set
        : ['http://localhost:3000', 'http://localhost:5173']; // Default dev origins
    
    // Log for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 CORS Check - Origin:', origin);
      console.log('🌐 CORS Check - Allowed Origins:', allowedOrigins);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.length === 0) {
      console.warn('⚠️  CORS_ORIGIN not set in production! Allowing all origins (not recommended)');
      return callback(null, true); // Allow all if not configured (for quick fix)
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.error('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

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

// Routes - V0.8
app.use("/api/produce", produceRoutes);
app.use("/api/demand", demandRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/sms", smsRoutes);

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Socket.IO implementation - V0.8 Enhanced
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join user-specific room
  socket.on("joinUser", (userId) => {
    socket.join(`user:${userId}`);
    console.log(`${socket.id} joined user room: user:${userId}`);
  });

  // Join location/crop room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  // Join match room for chat
  socket.on("joinMatch", (matchId) => {
    socket.join(`match:${matchId}`);
    console.log(`${socket.id} joined match: ${matchId}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`${socket.id} left ${room}`);
  });

  socket.on("leaveMatch", (matchId) => {
    socket.leave(`match:${matchId}`);
    console.log(`${socket.id} left match: ${matchId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Allow routes to use io if needed
app.set("io", io);

// Connect DB and start server
(async () => {
  // Validate environment variables before starting
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is missing!");
    console.error("Please set it in Render dashboard → Environment → Add Environment Variable");
    process.exit(1);
  }

  console.log("🔍 Environment Check:");
  console.log("  ✓ PORT:", PORT);
  console.log("  ✓ NODE_ENV:", process.env.NODE_ENV || "development");
  console.log("  ✓ MONGODB_URI:", process.env.MONGODB_URI ? "Set ✓" : "Missing ❌");
  console.log("  ✓ CORS_ORIGIN:", process.env.CORS_ORIGIN || "Not set (allowing all in dev)");
  console.log("  ✓ AT_USERNAME:", process.env.AT_USERNAME || "Not set");
  console.log("  ✓ AT_API_KEY:", process.env.AT_API_KEY ? "Set ✓" : "Not set");
  console.log("");

  await connectDB(process.env.MONGODB_URI);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  });
})();
