// src/utils/clerkVerify.js
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";

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

export { requireAuth, getAuth };
