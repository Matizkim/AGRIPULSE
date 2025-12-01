// src/utils/clerkVerify.js
import { clerkMiddleware, requireAuth as clerkRequireAuth, getAuth } from "@clerk/express";

// Check if auth is disabled for development
const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";

if (AUTH_DISABLED) {
  console.warn("⚠️  WARNING: Authentication is DISABLED for development!");
  console.warn("⚠️  Set DISABLE_AUTH=false in production!");
}

// Global Clerk middleware (called in server.js)
export const clerkMiddlewareAdapter = clerkMiddleware();

// Convert req.auth → req.user (for compatibility with your existing logic)
export function mapReqAuthToReqUser(req, res, next) {
  try {
    if (req.auth) {
      req.user = {
        userId: req.auth.userId,
        sessionId: req.auth.sessionId,
      };
    }
  } catch (err) {
    // ignore mapping errors
  }
  next();
}

// Wrapper for requireAuth that can be disabled for development
export function requireAuth() {
  if (AUTH_DISABLED) {
    // Auth is disabled - allow all requests
    return (req, res, next) => {
      // Mock auth for development
      req.auth = {
        userId: "dev-user",
        sessionId: "dev-session"
      };
      req.user = {
        userId: "dev-user",
        sessionId: "dev-session"
      };
      next();
    };
  }
  // Use real Clerk auth
  return clerkRequireAuth();
}

export { getAuth };
