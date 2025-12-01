// src/utils/authorization.js
// Role-based authorization middleware

/**
 * Middleware to require user verification
 * Users must be verified by admin before performing operations
 */
export function requireVerification() {
  return async (req, res, next) => {
    try {
      if (!req.localUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Admin bypass
      if (req.localUser.roles?.includes("admin")) {
        return next();
      }

      // Check verification status
      if (!req.localUser.isVerified || req.localUser.verificationStatus !== "approved") {
        return res.status(403).json({ 
          error: "Account verification required. Your account is pending admin verification. Please wait for approval before performing operations.",
          verificationStatus: req.localUser.verificationStatus || "pending"
        });
      }

      next();
    } catch (err) {
      console.error("Error in requireVerification middleware:", err);
      res.status(500).json({ error: "Verification check failed" });
    }
  };
}

/**
 * Middleware to require specific role(s)
 * @param {string|string[]} roles - Single role or array of roles
 * @param {boolean} requireAll - If true, user must have ALL roles. If false, user needs ANY role.
 */
export function requireRole(roles, requireAll = false) {
  return async (req, res, next) => {
    try {
      // ALWAYS enforce role checks - even in dev mode
      // DISABLE_AUTH only bypasses Clerk authentication, not role-based authorization

      // Ensure user is authenticated and has localUser
      if (!req.localUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userRoles = req.localUser.roles || [];
      const roleArray = Array.isArray(roles) ? roles : [roles];

      // Log for debugging (always log in dev)
      console.log(`🔍 Role check - User ID: ${req.localUser._id}, User roles: [${userRoles.join(", ")}], Required: [${roleArray.join(", ")}]`);

      // Admin always has access
      if (userRoles.includes("admin")) {
        return next();
      }

      // Check role requirements
      if (requireAll) {
        // User must have ALL specified roles
        const hasAllRoles = roleArray.every(role => userRoles.includes(role));
        if (!hasAllRoles) {
          console.log(`❌ Role check failed - User missing required roles: [${roleArray.join(", ")}]`);
          return res.status(403).json({ 
            error: `Access denied. Required roles: ${roleArray.join(", ")}. Your roles: [${userRoles.join(", ")}]` 
          });
        }
      } else {
        // User needs ANY of the specified roles
        const hasAnyRole = roleArray.some(role => userRoles.includes(role));
        if (!hasAnyRole) {
          console.log(`❌ Role check failed - User missing required role. Required one of: [${roleArray.join(", ")}], User has: [${userRoles.join(", ")}]`);
          return res.status(403).json({ 
            error: `Access denied. Required one of: ${roleArray.join(", ")}. Your roles: [${userRoles.join(", ")}]` 
          });
        }
      }

      console.log(`✅ Role check passed - User has required role`);
      next();
    } catch (err) {
      console.error("Error in requireRole middleware:", err);
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}

/**
 * Middleware to require that user is the owner of a resource
 * @param {Function} getResourceId - Function to extract resource ID from request
 * @param {Function} getOwnerId - Function to get owner ID from resource
 * @param {string} resourceName - Name of resource for error messages
 */
export function requireOwner(getResourceId, getOwnerId, resourceName = "resource") {
  return async (req, res, next) => {
    try {
      // In dev mode, bypass owner checks if DISABLE_AUTH is true
      if (process.env.DISABLE_AUTH === "true") {
        console.log("⚠️ DEV MODE: Bypassing owner check");
        return next();
      }

      if (!req.localUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Admin always has access
      if (req.localUser.roles?.includes("admin")) {
        return next();
      }

      const resourceId = getResourceId(req);
      if (!resourceId) {
        return res.status(400).json({ error: `Invalid ${resourceName} ID` });
      }

      // Get the resource and check ownership
      const ownerId = await getOwnerId(resourceId);
      if (!ownerId) {
        return res.status(404).json({ error: `${resourceName} not found` });
      }

      const userId = req.localUser._id.toString();
      const ownerIdStr = ownerId.toString();

      if (userId !== ownerIdStr) {
        return res.status(403).json({ 
          error: `You are not authorized to modify this ${resourceName}` 
        });
      }

      next();
    } catch (err) {
      console.error("Error in requireOwner middleware:", err);
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}

/**
 * Helper to check if user has any of the specified roles
 */
export function hasRole(user, roles) {
  if (!user || !user.roles) return false;
  if (user.roles.includes("admin")) return true; // Admin has all roles
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.some(role => user.roles.includes(role));
}

/**
 * Helper to check if user is owner or admin
 */
export function isOwnerOrAdmin(user, ownerId) {
  if (!user || !ownerId) return false;
  if (user.roles?.includes("admin")) return true;
  return user._id.toString() === ownerId.toString();
}

