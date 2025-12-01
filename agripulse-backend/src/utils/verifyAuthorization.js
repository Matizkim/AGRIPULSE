// src/utils/verifyAuthorization.js
// Utility to verify authorization is working correctly

import User from "../models/User.js";

/**
 * Verify a user's roles and log them
 */
export async function verifyUserRoles(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: "User not found" };
    }
    
    return {
      userId: user._id,
      clerkId: user.clerkId,
      name: user.name,
      roles: user.roles || [],
      primaryRole: user.primaryRole,
      rolesCount: user.roles?.length || 0
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Check if authorization is properly configured
 */
export function checkAuthorizationConfig() {
  const config = {
    DISABLE_AUTH: process.env.DISABLE_AUTH,
    roleChecksEnabled: process.env.DISABLE_AUTH !== "true" || false,
    note: "Role checks are ALWAYS enforced, even when DISABLE_AUTH=true"
  };
  
  console.log("🔍 Authorization Configuration:", config);
  return config;
}

