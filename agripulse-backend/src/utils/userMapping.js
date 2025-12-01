// src/utils/userMapping.js
import User from "../models/User.js";
import { getAuth } from "@clerk/express";

const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";

/**
 * Middleware to create or get local User from Clerk authentication
 * Maps Clerk userId (string) to local User ObjectId
 * Sets req.localUser for use in routes
 */
export async function createOrGetLocalUser(req, res, next) {
  try {
    let auth;
    
    // Handle dev mode with disabled auth
    let clerkId;
    if (AUTH_DISABLED) {
      // CRITICAL FIX: In dev mode, try to get actual Clerk user ID from frontend
      // Frontend might still send Clerk user ID even when auth is disabled
      // Check Authorization header or custom header
      const authHeader = req.headers.authorization;
      let actualClerkUserId = null;
      
      // Try to extract Clerk user ID from headers (frontend might send it)
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // In dev mode, frontend might send Clerk user ID in a custom header
        actualClerkUserId = req.headers['x-clerk-user-id'] || 
                           req.headers['x-dev-user-id'] ||
                           req.cookies?.['clerk-user-id'];
      }
      
      // Try to extract Clerk user ID from JWT token (even in dev mode)
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            if (payload.sub || payload.user_id) {
              clerkId = payload.sub || payload.user_id;
              auth = { userId: clerkId };
              console.log(`🔧 Dev mode: Extracted Clerk user ID from token: ${clerkId}`);
            }
          }
        } catch (err) {
          // Token decode failed, continue to fallback
        }
      }
      
      // If we have an actual Clerk user ID from header, use it
      if (!clerkId && actualClerkUserId && actualClerkUserId !== "dev-user") {
        clerkId = actualClerkUserId;
        auth = { userId: clerkId };
        console.log(`🔧 Dev mode: Using Clerk user ID from header: ${clerkId}`);
      }
      
      // Final fallback: Use session-based unique ID
      if (!clerkId || clerkId === "dev-user") {
        const sessionKey = (req.ip || 'unknown') + (req.headers['user-agent'] || '');
        const crypto = await import('crypto');
        const sessionHash = crypto.createHash('md5').update(sessionKey).digest('hex').substring(0, 16);
        clerkId = `dev-session-${sessionHash}`;
        auth = { userId: clerkId };
        console.log(`🔧 Dev mode: Using session-based user ID: ${clerkId}`);
      }
    } else {
      // Get Clerk auth (should be available from clerkMiddleware)
      auth = getAuth(req);
      if (!auth || !auth.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      clerkId = auth.userId;
    }
    
    if (!clerkId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Try to find existing user
    let user = await User.findOne({ clerkId });
    
    // CRITICAL: If user exists but roles are missing/empty, ensure they have at least primaryRole
    // BUT: Only fix roles if user has already selected a tier (they've gone through plan selection)
    // This prevents roles from being lost, but allows new users to select tier first
    if (user && (!user.roles || user.roles.length === 0) && user.tier) {
      console.warn("⚠️ User found but roles array is empty or missing:", {
        userId: user._id,
        clerkId: user.clerkId,
        primaryRole: user.primaryRole,
        roles: user.roles,
        tier: user.tier
      });
      
      // Ensure user has at least their primaryRole in roles array
      if (user.primaryRole) {
        await User.updateOne(
          { _id: user._id },
          { $set: { roles: [user.primaryRole] } }
        );
        // Reload user to get updated data
        user = await User.findById(user._id);
        console.log("✅ Fixed empty roles array, set to:", user.roles);
      }
      // Note: We don't set default roles if user doesn't have primaryRole
      // They must go through onboarding to select their role
    }

    // If user doesn't exist, create one
    if (!user) {
      // Get additional info from Clerk
      let clerkUser = {};
      let email = "";
      let name = "User";
      let phone = "";
      
      if (!AUTH_DISABLED) {
        // Try to get Clerk user data
        try {
          const { clerkClient } = await import("@clerk/clerk-sdk-node");
          clerkUser = await clerkClient.users.getUser(clerkId);
          
          // Extract email (try multiple sources)
          email = clerkUser.emailAddresses?.[0]?.emailAddress || 
                  clerkUser.primaryEmailAddress?.emailAddress ||
                  "";
          
          // Extract name
          name = clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.lastName || clerkUser.username || "User";
          
          // Extract phone
          phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || 
                  clerkUser.primaryPhoneNumber?.phoneNumber ||
                  "";
        } catch (err) {
          console.warn("Could not fetch Clerk user data:", err);
        }
      } else {
        email = "dev@example.com";
        name = "Dev User";
        phone = "+254700000000";
      }
      
      // Create user WITHOUT role - they must select it on first login
      const userData = {
        clerkId,
        name,
        email,
        phone,
        // NO primaryRole or roles - user must select on onboarding
        // NO tier - user must select on plan selection page (will be undefined/null)
        tier: undefined, // Explicitly set to undefined to avoid validation issues
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      try {
        user = await User.create(userData);
        console.log(`✅ Created new local user for Clerk ID: ${clerkId} (email: ${email}, role selection required)`);
      } catch (createErr) {
        console.error("❌ Error creating user:", createErr);
        console.error("  - User data:", userData);
        console.error("  - Error name:", createErr.name);
        console.error("  - Error message:", createErr.message);
        
        // If it's a duplicate key error, try to find the existing user
        if (createErr.code === 11000 || createErr.name === "MongoServerError") {
          console.log("⚠️ Duplicate key error, trying to find existing user...");
          user = await User.findOne({ clerkId });
          if (user) {
            console.log("✅ Found existing user with same clerkId");
          } else {
            throw createErr; // Re-throw if we can't find the user
          }
        } else {
          throw createErr; // Re-throw other errors
        }
      }
    } else {
      // CRITICAL FIX: Only update lastActiveAt without triggering full save
      // This prevents Mongoose from resetting roles or applying defaults
      // Use updateOne to update only the lastActiveAt field
      // This ensures roles and primaryRole are NOT touched
      await User.updateOne(
        { _id: user._id },
        { $set: { lastActiveAt: new Date() } }
      );
      // Update the in-memory user object to reflect the change
      user.lastActiveAt = new Date();
      
      // Log user roles to help debug any role reset issues
      console.log("✅ User loaded (roles preserved):", {
        userId: user._id,
        clerkId: user.clerkId,
        roles: user.roles,
        primaryRole: user.primaryRole
      });
    }

    // Ensure user object is valid before attaching
    if (!user || !user._id) {
      console.error("❌ Invalid user object after creation/retrieval");
      return res.status(500).json({ 
        error: "Failed to create or retrieve user",
        details: process.env.NODE_ENV === "development" ? "User object is invalid" : undefined
      });
    }

    // Attach local user to request
    req.localUser = user;
    req.user = {
      userId: clerkId, // Keep for backward compatibility
      localUserId: user._id, // New: local ObjectId
      user: user // Full user object
    };

    // Debug logging
    console.log("✅ User attached to request:");
    console.log("  - clerkId:", clerkId);
    console.log("  - localUser._id:", user._id);
    console.log("  - localUser.name:", user.name);
    console.log("  - localUser.tier:", user.tier);

    next();
  } catch (err) {
    console.error("❌ Error in createOrGetLocalUser:", err);
    console.error("  - Error message:", err.message);
    console.error("  - Error stack:", err.stack);
    res.status(500).json({ 
      error: "Failed to authenticate user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
}

/**
 * Combined middleware: require auth + create/get local user
 * Use this instead of separate requireAuth + createOrGetLocalUser
 */
export function requireAuthAndMapUser() {
  return async (req, res, next) => {
    // First check auth (Clerk)
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Then create/get local user
    await createOrGetLocalUser(req, res, next);
  };
}

