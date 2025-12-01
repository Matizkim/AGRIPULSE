// src/routes/users.js
import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";

const router = express.Router();

// Get current user profile
router.get("/me", requireAuth(), createOrGetLocalUser, async (req, res) => {
  try {
    if (!req.localUser || !req.localUser._id) {
      console.error("❌ No localUser found in request");
      return res.status(500).json({ error: "User not found in session" });
    }
    
    const user = await User.findById(req.localUser._id)
      .select("-__v");
    
    if (!user) {
      console.error("❌ User not found in database:", req.localUser._id);
      return res.status(404).json({ error: "User not found" });
    }
    
    // Add debug info in development
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 User Profile Request:");
      console.log("  - User ID:", user._id);
      console.log("  - Roles:", user.roles);
      console.log("  - Primary Role:", user.primaryRole);
      console.log("  - Tier:", user.tier);
    }
    
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    console.error("  - Error message:", err.message);
    console.error("  - Error stack:", err.stack);
    res.status(500).json({ 
      error: "Could not fetch user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Update user profile
router.put(
  "/me",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!req.localUser || !req.localUser._id) {
        console.error("❌ No localUser found in request");
        return res.status(500).json({ error: "User not found in session" });
      }
      
      const user = await User.findById(req.localUser._id);
      
      if (!user) {
        console.error("❌ User not found in database:", req.localUser._id);
        return res.status(404).json({ error: "User not found" });
      }
      
      // Log incoming request with full details
      console.log("📥 Profile update request:");
      console.log("  - User ID:", req.localUser._id);
      console.log("  - Current roles:", user.roles);
      console.log("  - Current primaryRole:", user.primaryRole);
      console.log("  - Current tier:", user.tier);
      console.log("  - Request body:", JSON.stringify(req.body, null, 2));
      console.log("  - Request body roles:", req.body.roles);
      console.log("  - Request body primaryRole:", req.body.primaryRole);
      console.log("  - Request body tier:", req.body.tier);

      // CRITICAL FIX: Only update roles/primaryRole if they are EXPLICITLY provided
      // and are valid arrays/strings (not empty, not null, not undefined)
      // This prevents accidental role changes from partial updates

      // Handle roles update - ONLY if explicitly provided as a valid array
      if (req.body.roles !== undefined && req.body.roles !== null) {
        const validRoles = ["farmer", "buyer", "driver", "admin"];
        const rolesArray = Array.isArray(req.body.roles) ? req.body.roles : [req.body.roles];
        
        // Filter out any invalid values (null, undefined, empty strings)
        const cleanRolesArray = rolesArray.filter(r => r && typeof r === "string" && r.trim() !== "");
        
        // Ensure at least one role
        if (cleanRolesArray.length === 0) {
          console.log("❌ Rejected: Empty roles array");
          return res.status(400).json({ error: "User must have at least one role" });
        }
        
        // Validate all roles are valid
        const invalidRoles = cleanRolesArray.filter(r => !validRoles.includes(r));
        if (invalidRoles.length > 0) {
          console.log("❌ Rejected: Invalid roles:", invalidRoles);
          return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(", ")}` });
        }
        
        // Only update if roles are actually different
        const currentRolesSet = new Set(user.roles || []);
        const newRolesSet = new Set(cleanRolesArray);
        const rolesChanged = currentRolesSet.size !== newRolesSet.size || 
                            ![...currentRolesSet].every(r => newRolesSet.has(r));
        
        if (rolesChanged) {
          console.log("✅ Updating roles:", user.roles, "->", cleanRolesArray);
          user.roles = [...new Set(cleanRolesArray)];
          
          // Ensure primaryRole is in roles array
          if (user.primaryRole && !user.roles.includes(user.primaryRole)) {
            console.log("  - Primary role not in new roles, setting to first role");
            user.primaryRole = user.roles[0];
          }
        } else {
          console.log("  - Roles unchanged, skipping update");
        }
      }

      // Handle primaryRole update - ONLY if explicitly provided as a valid string
      if (req.body.primaryRole !== undefined && req.body.primaryRole !== null && req.body.primaryRole !== "") {
        const validRoles = ["farmer", "buyer", "driver", "admin"];
        const newPrimaryRole = String(req.body.primaryRole).trim();
        
        if (!validRoles.includes(newPrimaryRole)) {
          console.log("❌ Rejected: Invalid primary role:", newPrimaryRole);
          return res.status(400).json({ error: "Invalid primary role" });
        }
        
        // Only update if primaryRole is actually different
        if (user.primaryRole !== newPrimaryRole) {
          console.log("✅ Updating primaryRole:", user.primaryRole, "->", newPrimaryRole);
          user.primaryRole = newPrimaryRole;
          
          // Ensure primaryRole is in roles array
          if (!user.roles || user.roles.length === 0) {
            // If no roles, set roles to just primaryRole
            user.roles = [newPrimaryRole];
          } else if (!user.roles.includes(newPrimaryRole)) {
            // Add primaryRole to roles if not present
            user.roles.push(newPrimaryRole);
            user.roles = [...new Set(user.roles)]; // Remove duplicates
          }
        } else {
          console.log("  - PrimaryRole unchanged, skipping update");
        }
      }

      // Update other fields (name, phone, etc.) - only if explicitly provided
      // Note: email is managed by Clerk and should not be updated here
      const allowedUpdates = [
        "name", "phone", "profilePicture", "bio",
        "isPhoneVerified", "isIdVerified"
      ];
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null) {
          // For string fields, only update if not empty
          if (typeof req.body[field] === "string" && req.body[field].trim() === "") {
            return; // Skip empty strings
          }
          user[field] = req.body[field];
        }
      });
      
      // Handle location update separately to validate structure
      if (req.body.location !== undefined && req.body.location !== null) {
        // Validate location structure
        if (typeof req.body.location === "object" && !Array.isArray(req.body.location)) {
          // Only update if location has at least county or town
          if (req.body.location.county || req.body.location.town) {
            user.location = {
              country: req.body.location.country || user.location?.country || "Kenya",
              county: req.body.location.county || user.location?.county || "",
              subcounty: req.body.location.subcounty || user.location?.subcounty || "",
              town: req.body.location.town || user.location?.town || "",
              lat: req.body.location.lat || user.location?.lat,
              lng: req.body.location.lng || user.location?.lng
            };
          }
        }
      }
      
      // Handle tier update
      if (req.body.tier !== undefined && req.body.tier !== null) {
        const validTiers = ["basic", "pro", "business"];
        const newTier = String(req.body.tier).trim().toLowerCase();
        
        if (!validTiers.includes(newTier)) {
          console.log("❌ Rejected: Invalid tier:", newTier);
          return res.status(400).json({ error: `Invalid tier. Must be one of: ${validTiers.join(", ")}` });
        }
        
        console.log("✅ Updating tier:", user.tier || "null", "->", newTier);
        user.tier = newTier;
        
        // Log tier update for debugging
        if (process.env.NODE_ENV === "development") {
          console.log("  - User ID:", user._id);
          console.log("  - Current tier:", user.tier);
        }
      }

      // Handle legal details update
      if (req.body.legalDetails !== undefined && req.body.legalDetails !== null) {
        if (!user.legalDetails) {
          user.legalDetails = {};
        }
        
        // Only update if legalDetails is an object
        if (typeof req.body.legalDetails === "object" && !Array.isArray(req.body.legalDetails)) {
          // Check if user is resubmitting after rejection
          const wasRejected = user.verificationStatus === "rejected";
          const isResubmitting = wasRejected && 
            (req.body.legalDetails.nationalId !== undefined || 
             req.body.legalDetails.nationalIdImage !== undefined);
          
          // Update legal details fields
          if (req.body.legalDetails.nationalId !== undefined) {
            user.legalDetails.nationalId = req.body.legalDetails.nationalId;
          }
          if (req.body.legalDetails.nationalIdImage !== undefined) {
            user.legalDetails.nationalIdImage = req.body.legalDetails.nationalIdImage;
          }
          
          // Set submittedAt and verification status if both required fields are present
          if (user.legalDetails.nationalId && user.legalDetails.nationalIdImage) {
            user.legalDetails.submittedAt = new Date();
            
            // If user was rejected and is resubmitting, reset to pending and increment retry count
            if (isResubmitting) {
              user.verificationStatus = "pending";
              user.verificationRejectedReason = ""; // Clear rejection reason
              user.verificationRetryCount = (user.verificationRetryCount || 0) + 1;
              console.log(`🔄 User ${user._id} resubmitting after rejection. Retry count: ${user.verificationRetryCount}`);
            } else if (!user.verificationStatus || user.verificationStatus === "pending") {
              // First time submission or already pending
              user.verificationStatus = "pending";
            }
          }
        }
      }
      
      // Handle verification status update (admin only)
      if (req.body.verificationStatus !== undefined) {
        const isAdmin = req.localUser.roles?.includes("admin");
        if (isAdmin) {
          user.verificationStatus = req.body.verificationStatus;
          if (req.body.verificationStatus === "approved") {
            user.isVerified = true;
            if (!user.legalDetails) user.legalDetails = {};
            user.legalDetails.reviewedAt = new Date();
            user.legalDetails.reviewedBy = req.localUser._id;
          } else if (req.body.verificationStatus === "rejected") {
            user.isVerified = false;
            user.verificationRejectedReason = req.body.verificationRejectedReason || "";
            if (!user.legalDetails) user.legalDetails = {};
            user.legalDetails.reviewedAt = new Date();
            user.legalDetails.reviewedBy = req.localUser._id;
          }
        }
      }

      // Save user
      await user.save();
      
      // Reload user from database to ensure we return the saved data
      const savedUser = await User.findById(user._id);
      
      console.log("✅ Profile saved successfully:");
      console.log("  - Saved roles:", savedUser.roles);
      console.log("  - Saved primaryRole:", savedUser.primaryRole);
      console.log("  - Verification status:", savedUser.verificationStatus);
      console.log("  - Legal details submitted:", !!savedUser.legalDetails?.submittedAt);
      
      res.json(savedUser);
    } catch (err) {
      console.error("❌ Error updating user:", err);
      console.error("  - Error message:", err.message);
      console.error("  - Error stack:", err.stack);
      
      // Return more specific error messages
      if (err.name === "ValidationError") {
        return res.status(400).json({ 
          error: "Validation error", 
          details: Object.keys(err.errors || {}).map(key => ({
            field: key,
            message: err.errors[key].message
          }))
        });
      }
      
      res.status(500).json({ 
        error: err.message || "Could not update user",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined
      });
    }
  }
);

// Get pending verifications (admin only) - MUST be before /:id route
router.get(
  "/pending-verification",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      // Check if user is admin
      if (!req.localUser.roles?.includes("admin")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Find all users with verification status or those who have submitted legal details
      const users = await User.find({
        $or: [
          { verificationStatus: { $in: ["pending", "approved", "rejected"] } },
          { "legalDetails.nationalId": { $exists: true, $ne: null } }
        ]
      })
        .select("name email phone primaryRole roles location legalDetails verificationStatus verificationRejectedReason verificationRetryCount createdAt")
        .sort({ "legalDetails.submittedAt": -1, createdAt: -1 })
        .lean();

      res.json({ users });
    } catch (err) {
      console.error("Error fetching pending verifications:", err);
      console.error("Error details:", err.message, err.stack);
      res.status(500).json({ error: "Could not fetch pending verifications", details: err.message });
    }
  }
);

// Get user by ID (public profile) - MUST be after specific routes like /pending-verification
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name profilePicture bio rating reviewsCount isVerified location primaryRole roles")
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Could not fetch user" });
  }
});

// Verify user (admin only)
router.post(
  "/:id/verify",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      // Check if user is admin
      if (!req.localUser.roles?.includes("admin")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { verificationStatus, verificationRejectedReason } = req.body;

      if (!["approved", "rejected"].includes(verificationStatus)) {
        return res.status(400).json({ error: "Invalid verification status" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.verificationStatus = verificationStatus;
      if (verificationStatus === "approved") {
        user.isVerified = true;
        if (!user.legalDetails) user.legalDetails = {};
        user.legalDetails.reviewedAt = new Date();
        user.legalDetails.reviewedBy = req.localUser._id;
      } else if (verificationStatus === "rejected") {
        user.isVerified = false;
        user.verificationRejectedReason = verificationRejectedReason || "";
        if (!user.legalDetails) user.legalDetails = {};
        user.legalDetails.reviewedAt = new Date();
        user.legalDetails.reviewedBy = req.localUser._id;
      }

      await user.save();

      res.json({ message: "Verification status updated", user });
    } catch (err) {
      console.error("Error updating verification:", err);
      res.status(500).json({ error: "Could not update verification status" });
    }
  }
);

export default router;


