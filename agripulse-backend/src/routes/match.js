// src/routes/match.js
import express from "express";
import Match from "../models/Match.js";
import ProduceListing from "../models/ProduceListing.js";
import MarketDemand from "../models/MarketDemand.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";
import { requireRole } from "../utils/authorization.js";
import { validateRequired, validateBodyObjectId, isValidObjectId } from "../utils/validation.js";
import mongoose from "mongoose";

const router = express.Router();

// Get matches - V0.9: Role-based visibility (private matches)
// Matches are private - users only see matches they're involved in
// Admin sees everything
router.get("/", requireAuth(), createOrGetLocalUser, async (req, res) => {
  try {
    const { 
      status, 
      myMatches // Only matches involving current user (default behavior)
    } = req.query;

    const userId = req.localUser._id;
    const userRoles = req.localUser.roles || [];
    const isAdmin = userRoles.includes("admin");
    const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";

    let query = {};

    // Admin sees everything
    if (isAdmin) {
      // Admin can see all matches, optionally filtered by status
      if (status) {
        query.status = status;
      }
    } else {
      // Regular users only see matches they're involved in
      // Build query to find matches where user is:
      // 1. The initiator
      // 2. The accepter
      // 3. The driver
      // 4. The farmer (owner of listing)
      // 5. The buyer (owner of demand)
      
      const $orConditions = [
        { initiatedBy: userId },
        { acceptedBy: userId },
        { driverId: userId }
      ];

      // Get user's listings and demands
      const userListings = await ProduceListing.find({ farmerId: userId }).select("_id");
      const userDemands = await MarketDemand.find({ buyerId: userId }).select("_id");
      
      const listingIds = userListings.map(l => l._id);
      const demandIds = userDemands.map(d => d._id);
      
      if (listingIds.length > 0) {
        $orConditions.push({ listingId: { $in: listingIds } });
      }
      if (demandIds.length > 0) {
        $orConditions.push({ demandId: { $in: demandIds } });
      }

      query.$or = $orConditions;

      // Filter by status if provided
      if (status) {
        query.status = status;
      }
    }


    const matches = await Match.find(query)
      .populate("listingId", "crop quantityKg expectedPrice location farmerId")
      .populate("demandId", "crop qtyKg priceOffer location buyerId")
      .populate("initiatedBy", "name")
      .populate("acceptedBy", "name")
      .populate("driverId", "name phone")
      .populate("listingId.farmerId", "name rating")
      .populate("demandId.buyerId", "name rating")
      .sort({ createdAt: -1 })
      .limit(100);

    // Format for frontend
    const formatted = matches.map((m) => ({
      _id: m._id,
      listing: m.listingId,
      demand: m.demandId,
      priceAgreed: m.priceAgreed,
      status: m.status,
      initiatedBy: m.initiatedBy,
      acceptedBy: m.acceptedBy,
      driverId: m.driverId,
      transportBooked: m.transportBooked,
      transportDetails: m.transportDetails,
      events: m.events,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ error: "Could not fetch matches" });
  }
});

// Get single match
router.get("/:id", requireAuth(), createOrGetLocalUser, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const match = await Match.findById(req.params.id)
      .populate("listingId")
      .populate("demandId")
      .populate("initiatedBy")
      .populate("acceptedBy")
      .populate("driverId")
      .populate("listingId.farmerId")
      .populate("demandId.buyerId");

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Check if user is authorized to view this match
    const userId = req.localUser._id;
    const isAuthorized = 
      match.initiatedBy._id.toString() === userId.toString() ||
      match.acceptedBy?._id?.toString() === userId.toString() ||
      match.driverId?._id?.toString() === userId.toString() ||
      match.listingId?.farmerId?._id?.toString() === userId.toString() ||
      match.demandId?.buyerId?._id?.toString() === userId.toString();

    const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";
    const isAdmin = req.localUser?.roles?.includes("admin");
    
    if (!isAuthorized && !isAdmin && !AUTH_DISABLED) {
      return res.status(403).json({ error: "Not authorized to view this match" });
    }

    res.json(match);
  } catch (err) {
    console.error("Error fetching match:", err);
    res.status(500).json({ error: "Could not fetch match" });
  }
});

// Create match - V0.9: Only farmers and buyers can create matches
router.post(
  "/",
  requireAuth(),
  createOrGetLocalUser,
  requireRole(["farmer", "buyer"]), // Only farmers and buyers can create matches
  validateRequired(["listingId", "demandId", "priceAgreed"]),
  validateBodyObjectId("listingId"),
  validateBodyObjectId("demandId"),
  async (req, res) => {
    try {
      let { listingId, demandId, priceAgreed, message } = req.body;

      // Ensure priceAgreed is a number
      priceAgreed = Number(priceAgreed);
      if (isNaN(priceAgreed)) {
        return res.status(400).json({ error: "priceAgreed must be a valid number" });
      }

      // Validate ObjectIds
      if (!isValidObjectId(listingId) || !isValidObjectId(demandId)) {
        return res.status(400).json({ error: "Invalid listingId or demandId" });
      }

      // Check if listing and demand exist
      const listing = await ProduceListing.findById(listingId);
      const demand = await MarketDemand.findById(demandId);

      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      if (!demand) {
        return res.status(404).json({ error: "Demand not found" });
      }

      // Check if listing is available
      if (listing.status !== "available") {
        return res.status(400).json({ error: "Listing is not available" });
      }

      // Check if demand is open
      if (demand.status !== "open") {
        return res.status(400).json({ error: "Demand is not open" });
      }

      // Check for duplicate match (check all statuses due to unique index)
      const existingMatch = await Match.findOne({
        listingId,
        demandId
      });

      if (existingMatch) {
        // Only prevent if it's an active match
        if (["requested", "offered", "accepted", "in_transit"].includes(existingMatch.status)) {
          return res.status(400).json({ error: "An active match already exists for this listing and demand" });
        }
        // If it's cancelled/completed/expired, we can create a new one, but need to handle the unique index
        // Option: Delete the old match or update it
        console.log(`⚠️ Found old ${existingMatch.status} match, will create new one`);
      }

      // Determine who can initiate
      const userId = req.localUser._id;
      
      // Use optional chaining and handle old data (Clerk IDs vs ObjectIds)
      const listingFarmerId = listing.farmerId?.toString();
      const demandBuyerId = demand.buyerId?.toString();
      const userIdStr = userId?.toString();
      
      // Convert to ObjectId for proper comparison
      const listingFarmerObjId = listing.farmerId;
      const demandBuyerObjId = demand.buyerId;
      
      const isFarmer = listingFarmerObjId && userId && listingFarmerObjId.equals(userId);
      const isBuyer = demandBuyerObjId && userId && demandBuyerObjId.equals(userId);

      // Enhanced logging
      console.log("🔍 Match creation authorization check:");
      console.log("  - User ID:", userIdStr);
      console.log("  - User roles:", req.localUser.roles);
      console.log("  - Listing farmer ID:", listingFarmerId);
      console.log("  - Demand buyer ID:", demandBuyerId);
      console.log("  - Is farmer:", isFarmer);
      console.log("  - Is buyer:", isBuyer);

      if (!isFarmer && !isBuyer) {
        console.log("❌ Authorization failed - User is neither the listing farmer nor the demand buyer");
        return res.status(403).json({ error: "Only the farmer (listing owner) or buyer (demand owner) can create a match" });
      }
      
      console.log("✅ Authorization passed - User can create match");

      // Determine initial status
      let initialStatus = "requested";
      if (isFarmer) {
        initialStatus = "offered"; // Farmer offering to buyer
      }

      // Create match
      const match = await Match.create({
        listingId,
        demandId,
        priceAgreed,
        initiatedBy: userId,
        status: initialStatus,
        events: [{
          who: userId,
          what: "created",
          message: message || "Match created",
          timestamp: new Date()
        }],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Add event to listing and demand (wrapped in try-catch for old data compatibility)
      try {
        listing.matchesCount = (listing.matchesCount || 0) + 1;
        await listing.save();
      } catch (err) {
        console.warn(`⚠️ Could not update listing matchesCount for ${listing._id}:`, err.message);
      }
      try {
        demand.matchesCount = (demand.matchesCount || 0) + 1;
        await demand.save();
      } catch (err) {
        console.warn(`⚠️ Could not update demand matchesCount for ${demand._id}:`, err.message);
      }

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("newMatch", match);
        // Notify specific users
        io.to(`user:${listing.farmerId}`).emit("matchCreated", match);
        io.to(`user:${demand.buyerId}`).emit("matchCreated", match);
      }

      // Populate and return
      const populated = await Match.findById(match._id)
        .populate("listingId")
        .populate("demandId")
        .populate("initiatedBy", "name")
        .lean(); // Use lean() to avoid Mongoose document issues

      // If populate failed, return the match without populated fields
      if (!populated) {
        console.warn("⚠️ Could not populate match, returning basic match object");
        return res.status(201).json(match);
      }

      res.status(201).json(populated);
    } catch (err) {
      console.error("❌ Error creating match:", err);
      console.error("❌ Error stack:", err.stack);
      console.error("❌ Request body:", req.body);
      console.error("❌ User ID:", req.localUser?._id);
      
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      
      // Handle duplicate key error (unique index constraint)
      if (err.code === 11000 || err.code === 11001) {
        return res.status(400).json({ 
          error: "A match already exists between this listing and demand. Please check your existing matches." 
        });
      }
      
      // More detailed error message
      const errorMessage = err.message || "Could not create match";
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined
      });
    }
  }
);

// Accept match - V0.8: Update status to accepted
router.post(
  "/:id/accept",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const match = await Match.findById(req.params.id)
        .populate("listingId")
        .populate("demandId");

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Debug logging
      console.log("DEBUG - Match found:", match._id);
      console.log("DEBUG - match.listingId:", match.listingId);
      console.log("DEBUG - match.demandId:", match.demandId);
      console.log("DEBUG - match.initiatedBy:", match.initiatedBy);
      
      if (!req.localUser || !req.localUser._id) {
        console.error("ERROR: req.localUser is missing or has no _id");
        return res.status(500).json({ error: "User authentication failed" });
      }
      
      if (!match.listingId || !match.demandId) {
        console.error("ERROR: Match is missing listingId or demandId");
        return res.status(400).json({ error: "Match data is incomplete" });
      }

      const userId = req.localUser._id;
      const userRoles = req.localUser.roles || [];
      const isListingOwner = match.listingId?.farmerId?.toString() === userId.toString();
      const isDemandOwner = match.demandId?.buyerId?.toString() === userId.toString();
      const isInitiator = match.initiatedBy?.toString() === userId.toString();

      // In dev mode with auth disabled, allow anyone to accept
      const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";
      
      if (!AUTH_DISABLED) {
        // Drivers CANNOT accept matches - only farmers and buyers can
        const isDriverOnly = userRoles.includes("driver") && 
                            !userRoles.includes("farmer") && 
                            !userRoles.includes("buyer");
        
        if (isDriverOnly) {
          return res.status(403).json({ 
            error: "Drivers cannot accept matches. Only farmers and buyers can accept match proposals." 
          });
        }

        // Only the non-initiator can accept
        if (isInitiator) {
          return res.status(400).json({ error: "You cannot accept your own match proposal" });
        }

        // Check if user is authorized (must be listing owner or demand owner)
        if (!isListingOwner && !isDemandOwner) {
          return res.status(403).json({ error: "Not authorized to accept this match" });
        }
      } else {
        console.log("⚠️ DEV MODE: Skipping authorization check for accept match");
      }

      // Check current status
      if (!["requested", "offered"].includes(match.status)) {
        return res.status(400).json({ error: `Cannot accept match in ${match.status} status` });
      }

      // Fix old matches that don't have initiatedBy
      if (!match.initiatedBy) {
        console.log("⚠️ Old match missing initiatedBy - setting to current user");
        match.initiatedBy = userId;
      }

      // Get match quantity - use the minimum of listing and demand quantities, or from match if specified
      const listingQty = match.listingId.quantityKg || 0;
      const demandQty = match.demandId.qtyKg || 0;
      const matchQuantity = match.quantityKg || Math.min(listingQty, demandQty);
      
      // Update match
      match.status = "accepted";
      match.acceptedBy = userId;
      match.quantityKg = matchQuantity; // Store the matched quantity
      match.events.push({
        who: userId,
        what: "accepted",
        message: req.body.message || "Match accepted",
        timestamp: new Date()
      });

      // Update listing and demand status and quantities (try-catch for old data with invalid IDs)
      try {
        match.listingId.status = "matched";
        // Subtract matched quantity from listing
        const remainingQuantity = (match.listingId.quantityKg || 0) - matchQuantity;
        if (remainingQuantity > 0) {
          match.listingId.quantityKg = remainingQuantity;
          match.listingId.status = "available"; // Still available if quantity remains
        } else {
          match.listingId.quantityKg = 0;
          match.listingId.status = "sold_out"; // Mark as sold out if no quantity left
        }
        await match.listingId.save();
      } catch (err) {
        console.warn("⚠️ Could not save listing (old data with invalid ID):", err.message);
      }
      
      try {
        // Subtract matched quantity from demand
        const remainingDemand = (match.demandId.qtyKg || 0) - matchQuantity;
        if (remainingDemand > 0) {
          match.demandId.qtyKg = remainingDemand;
          match.demandId.status = "open"; // Still open if quantity remains
        } else {
          match.demandId.qtyKg = 0;
          match.demandId.status = "fulfilled"; // Mark as fulfilled if no quantity left
        }
        await match.demandId.save();
      } catch (err) {
        console.warn("⚠️ Could not save demand (old data with invalid ID):", err.message);
      }
      
      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchAccepted", match);
        io.to(`user:${match.initiatedBy}`).emit("matchAccepted", match);
      }

      const populated = await Match.findById(match._id)
        .populate("listingId")
        .populate("demandId")
        .populate("initiatedBy")
        .populate("acceptedBy");

      res.json(populated);
    } catch (err) {
      console.error("Error accepting match:", err);
      res.status(500).json({ error: "Could not accept match" });
    }
  }
);

// Reject/Cancel match
router.post(
  "/:id/cancel",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const match = await Match.findById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const userId = req.localUser._id;
      const userRoles = req.localUser.roles || [];
      const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";
      
      if (!AUTH_DISABLED) {
        // Drivers CANNOT cancel matches - only farmers and buyers can
        const isDriverOnly = userRoles.includes("driver") && 
                            !userRoles.includes("farmer") && 
                            !userRoles.includes("buyer");
        
        if (isDriverOnly) {
          return res.status(403).json({ 
            error: "Drivers cannot cancel matches. Only farmers and buyers can cancel matches." 
          });
        }

        const isAuthorized = 
          match.initiatedBy?.toString() === userId.toString() ||
          match.acceptedBy?.toString() === userId.toString();

        if (!isAuthorized) {
          return res.status(403).json({ error: "Not authorized to cancel this match" });
        }
      } else {
        console.log("⚠️ DEV MODE: Skipping authorization check for cancel match");
      }

      // Fix old matches that don't have initiatedBy
      if (!match.initiatedBy) {
        console.log("⚠️ Old match missing initiatedBy - setting to current user");
        match.initiatedBy = userId;
      }

      match.status = "cancelled";
      match.events.push({
        who: userId,
        what: "cancelled",
        message: req.body.reason || "Match cancelled",
        timestamp: new Date()
      });

      // Revert listing and demand status if accepted
      if (match.status === "accepted") {
        const listing = await ProduceListing.findById(match.listingId);
        const demand = await MarketDemand.findById(match.demandId);
        if (listing) {
          listing.status = "available";
          await listing.save();
        }
        if (demand) {
          demand.status = "open";
          await demand.save();
        }
      }

      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchCancelled", match);
      }

      res.json({ message: "Match cancelled successfully", match });
    } catch (err) {
      console.error("Error cancelling match:", err);
      res.status(500).json({ error: "Could not cancel match" });
    }
  }
);

// Assign driver to match
router.post(
  "/:id/assign-driver",
  requireAuth(),
  createOrGetLocalUser,
  validateBodyObjectId("driverId"),
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const { driverId, transportDetails } = req.body;

      const match = await Match.findById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      if (match.status !== "accepted") {
        return res.status(400).json({ error: "Match must be accepted before assigning driver" });
      }

      // Check authorization (initiator or acceptor can assign driver)
      const userId = req.localUser._id;
      const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";
      
      if (!AUTH_DISABLED) {
        const isAuthorized = 
          match.initiatedBy?.toString() === userId.toString() ||
          match.acceptedBy?.toString() === userId.toString();

        if (!isAuthorized) {
          return res.status(403).json({ error: "Not authorized to assign driver" });
        }
      } else {
        console.log("⚠️ DEV MODE: Skipping authorization check for assign driver");
      }

      // Fix old matches that don't have initiatedBy
      if (!match.initiatedBy) {
        console.log("⚠️ Old match missing initiatedBy - setting to current user");
        match.initiatedBy = userId;
      }

      match.driverId = driverId;
      match.transportPoolId = req.body.transportPoolId || null;
      match.transportBooked = true;
      match.transportDetails = transportDetails || {};
      match.status = "driver_assigned"; // Changed to driver_assigned - driver needs to accept
      match.driverAssignmentStatus = "pending"; // Driver needs to accept
      match.events.push({
        who: userId,
        what: "driver_assigned",
        message: `Driver assigned: ${driverId}. Waiting for driver acceptance.`,
        metadata: { driverId, transportDetails },
        timestamp: new Date()
      });

      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchDriverAssigned", match);
        io.to(`user:${driverId}`).emit("matchAssigned", match);
      }

      const populated = await Match.findById(match._id)
        .populate("driverId")
        .populate("listingId")
        .populate("demandId");

      res.json(populated);
    } catch (err) {
      console.error("Error assigning driver:", err);
      res.status(500).json({ error: "Could not assign driver" });
    }
  }
);

// Driver accept assignment
router.post(
  "/:id/driver-accept",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const match = await Match.findById(req.params.id)
        .populate("listingId")
        .populate("demandId")
        .populate("driverId");

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Check if user is the assigned driver
      const userId = req.localUser._id;
      if (match.driverId?._id?.toString() !== userId.toString()) {
        return res.status(403).json({ error: "Only the assigned driver can accept this assignment" });
      }

      if (match.driverAssignmentStatus !== "pending") {
        return res.status(400).json({ error: `Driver assignment is already ${match.driverAssignmentStatus}` });
      }

      match.driverAssignmentStatus = "accepted";
      match.driverAcceptedAt = new Date();
      match.status = "driver_accepted";
      match.events.push({
        who: userId,
        what: "driver_accepted",
        message: "Driver accepted the assignment",
        timestamp: new Date()
      });

      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchDriverAccepted", match);
        io.to(`user:${match.initiatedBy}`).emit("matchUpdated", match);
        io.to(`user:${match.acceptedBy}`).emit("matchUpdated", match);
      }

      const populated = await Match.findById(match._id)
        .populate("driverId", "name phone email profilePicture")
        .populate("listingId")
        .populate("demandId")
        .populate("listingId.farmerId", "name phone email profilePicture")
        .populate("demandId.buyerId", "name phone email profilePicture");

      res.json(populated);
    } catch (err) {
      console.error("Error accepting driver assignment:", err);
      res.status(500).json({ error: "Could not accept assignment" });
    }
  }
);

// Driver reject assignment (only before accepting)
router.post(
  "/:id/driver-reject",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const match = await Match.findById(req.params.id);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Check if user is the assigned driver
      const userId = req.localUser._id;
      if (match.driverId?.toString() !== userId.toString()) {
        return res.status(403).json({ error: "Only the assigned driver can reject this assignment" });
      }

      if (match.driverAssignmentStatus !== "pending") {
        return res.status(400).json({ error: "Can only reject before accepting. To cancel after acceptance, request cancellation." });
      }

      match.driverAssignmentStatus = "rejected";
      match.driverRejectedAt = new Date();
      match.status = "driver_rejected";
      match.driverId = null; // Remove driver assignment
      match.transportBooked = false;
      match.events.push({
        who: userId,
        what: "driver_rejected",
        message: "Driver rejected the assignment",
        timestamp: new Date()
      });

      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchDriverRejected", match);
      }

      res.json(match);
    } catch (err) {
      console.error("Error rejecting driver assignment:", err);
      res.status(500).json({ error: "Could not reject assignment" });
    }
  }
);

// Driver request cancellation (after accepting)
router.post(
  "/:id/driver-request-cancellation",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const { reason } = req.body;

      const match = await Match.findById(req.params.id);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Check if user is the assigned driver
      const userId = req.localUser._id;
      if (match.driverId?.toString() !== userId.toString()) {
        return res.status(403).json({ error: "Only the assigned driver can request cancellation" });
      }

      if (match.driverAssignmentStatus !== "accepted") {
        return res.status(400).json({ error: "Can only request cancellation after accepting" });
      }

      match.driverCancellationRequest = {
        requestedAt: new Date(),
        reason: reason || "",
        status: "pending"
      };
      match.events.push({
        who: userId,
        what: "driver_cancellation_requested",
        message: `Driver requested cancellation: ${reason || "No reason provided"}`,
        timestamp: new Date()
      });

      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchDriverCancellationRequested", match);
        // Notify buyer/farmer
        io.to(`user:${match.initiatedBy}`).emit("matchUpdated", match);
        io.to(`user:${match.acceptedBy}`).emit("matchUpdated", match);
      }

      res.json(match);
    } catch (err) {
      console.error("Error requesting cancellation:", err);
      res.status(500).json({ error: "Could not request cancellation" });
    }
  }
);

// Approve/reject driver cancellation (by buyer/farmer)
router.post(
  "/:id/approve-driver-cancellation",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const { approve } = req.body; // true to approve, false to reject

      const match = await Match.findById(req.params.id);

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      if (!match.driverCancellationRequest || match.driverCancellationRequest.status !== "pending") {
        return res.status(400).json({ error: "No pending cancellation request" });
      }

      // Check if user is buyer or farmer (not driver)
      const userId = req.localUser._id;
      const isAuthorized = 
        match.initiatedBy?.toString() === userId.toString() ||
        match.acceptedBy?.toString() === userId.toString();

      if (!isAuthorized) {
        return res.status(403).json({ error: "Only buyer or farmer can approve cancellation" });
      }

      if (approve) {
        match.driverCancellationRequest.status = "approved";
        match.driverCancellationRequest.approvedBy = userId;
        match.driverCancellationRequest.approvedAt = new Date();
        match.status = "cancelled";
        match.driverAssignmentStatus = "cancelled";
        match.driverId = null;
        match.transportBooked = false;
        match.events.push({
          who: userId,
          what: "driver_cancellation_approved",
          message: "Driver cancellation approved",
          timestamp: new Date()
        });
      } else {
        match.driverCancellationRequest.status = "rejected";
        match.driverCancellationRequest.approvedBy = userId;
        match.driverCancellationRequest.approvedAt = new Date();
        match.events.push({
          who: userId,
          what: "driver_cancellation_rejected",
          message: "Driver cancellation rejected",
          timestamp: new Date()
        });
      }

      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchDriverCancellationProcessed", match);
        io.to(`user:${match.driverId}`).emit("matchUpdated", match);
      }

      res.json(match);
    } catch (err) {
      console.error("Error processing cancellation:", err);
      res.status(500).json({ error: "Could not process cancellation" });
    }
  }
);

// Get driver's trips (all statuses)
router.get(
  "/driver/my-trips",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      const userId = req.localUser._id;
      const { status } = req.query; // Optional filter by status

      const query = { driverId: userId };
      if (status) {
        query.status = status;
      }

      const matches = await Match.find(query)
        .populate("listingId")
        .populate("demandId")
        .populate("initiatedBy", "name phone email profilePicture")
        .populate("acceptedBy", "name phone email profilePicture")
        .populate("listingId.farmerId", "name phone email profilePicture")
        .populate("demandId.buyerId", "name phone email profilePicture")
        .sort({ createdAt: -1 });

      res.json(matches);
    } catch (err) {
      console.error("Error fetching driver trips:", err);
      res.status(500).json({ error: "Could not fetch trips" });
    }
  }
);

// Complete match
router.post(
  "/:id/complete",
  requireAuth(),
  createOrGetLocalUser,
  async (req, res) => {
    try {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const match = await Match.findById(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      if (match.status !== "in_transit" && match.status !== "accepted") {
        return res.status(400).json({ error: "Match must be in transit or accepted to complete" });
      }

      const userId = req.localUser._id;
      const userRoles = req.localUser.roles || [];
      const AUTH_DISABLED = process.env.DISABLE_AUTH === "true";
      
      if (!AUTH_DISABLED) {
        // Drivers CANNOT complete matches - only farmers and buyers can
        const isDriverOnly = userRoles.includes("driver") && 
                            !userRoles.includes("farmer") && 
                            !userRoles.includes("buyer");
        
        if (isDriverOnly) {
          return res.status(403).json({ 
            error: "Drivers cannot complete matches. Only farmers and buyers can mark matches as complete." 
          });
        }

        const isAuthorized = 
          match.initiatedBy?.toString() === userId.toString() ||
          match.acceptedBy?.toString() === userId.toString();

        if (!isAuthorized) {
          return res.status(403).json({ error: "Not authorized to complete this match" });
        }
      } else {
        console.log("⚠️ DEV MODE: Skipping authorization check for complete match");
      }

      // Fix old matches that don't have initiatedBy
      if (!match.initiatedBy) {
        console.log("⚠️ Old match missing initiatedBy - setting to current user");
        match.initiatedBy = userId;
      }

      match.status = "completed";
      match.completedAt = new Date();
      match.events.push({
        who: userId,
        what: "completed",
        message: req.body.message || "Match completed",
        timestamp: new Date()
      });

      // Update listing and demand (try-catch for old data with invalid IDs)
      try {
        const listing = await ProduceListing.findById(match.listingId);
        if (listing) {
          listing.status = "sold";
          await listing.save();
        }
      } catch (err) {
        console.warn("⚠️ Could not save listing (old data with invalid ID):", err.message);
      }
      
      try {
        const demand = await MarketDemand.findById(match.demandId);
        if (demand) {
          demand.status = "fulfilled";
          await demand.save();
        }
      } catch (err) {
        console.warn("⚠️ Could not save demand (old data with invalid ID):", err.message);
      }

      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("matchCompleted", match);
      }

      const populated = await Match.findById(match._id)
        .populate("listingId")
        .populate("demandId")
        .populate("driverId");

      res.json(populated);
    } catch (err) {
      console.error("Error completing match:", err);
      res.status(500).json({ error: "Could not complete match" });
    }
  }
);

export default router;
