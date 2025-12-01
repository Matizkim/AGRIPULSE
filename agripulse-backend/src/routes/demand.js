// src/routes/demand.js
import express from "express";
import MarketDemand from "../models/MarketDemand.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";
import { requireRole, isOwnerOrAdmin, requireVerification } from "../utils/authorization.js";
import { validateRequired, validateEnum, validateNumberRange } from "../utils/validation.js";

const router = express.Router();

// Create market demand (buyer only) - V0.8: Uses local User ObjectId
router.post(
  "/",
  requireAuth(),
  createOrGetLocalUser,
  requireVerification(), // Must be verified
  requireRole("buyer"), // Only buyers can post demands
  validateRequired(["crop", "qtyKg", "location"]),
  validateEnum("category", ["vegetables", "fruits", "cereals", "legumes", "roots", "other"]),
  validateEnum("urgency", ["low", "medium", "high", "urgent"]),
  validateNumberRange("qtyKg", 0),
  validateNumberRange("priceOffer", 0),
  async (req, res) => {
    try {
      const { 
        crop, 
        category,
        qtyKg, 
        priceOffer,
        isPriceNegotiable,
        pickupWindow, 
        location,
        urgency,
        preferredPickupRadiusKm,
        contactVisibility,
        expiresAt,
        images
      } = req.body;

      // Use local User ObjectId (not Clerk ID)
      const demand = await MarketDemand.create({
        buyerId: req.localUser._id,
        crop,
        category: category || "other",
        qtyKg,
        priceOffer,
        isPriceNegotiable: isPriceNegotiable !== undefined ? isPriceNegotiable : true,
        pickupWindow: pickupWindow ? {
          start: new Date(pickupWindow.start),
          end: new Date(pickupWindow.end)
        } : undefined,
        location: {
          county: location?.county,
          town: location?.town,
          lat: location?.lat,
          lng: location?.lng
        },
        urgency: urgency || "medium",
        preferredPickupRadiusKm: preferredPickupRadiusKm || 50,
        contactVisibility: contactVisibility || "on_match",
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        images: images || [],
        status: "open"
      });

      // Emit Socket.IO event for real-time updates
      const io = req.app.get("io");
      if (io) {
        // Emit to all clients
        io.emit("newDemand", demand);
        // Also emit to location-specific room (e.g., "Nairobi:tomatoes")
        if (location?.county && crop) {
          const room = `${location.county}:${crop}`.toLowerCase();
          io.to(room).emit("newDemand", demand);
        }
        // Emit to category room
        if (category) {
          const categoryRoom = `category:${category}`.toLowerCase();
          io.to(categoryRoom).emit("newDemand", demand);
        }
        // Emit to urgency room
        if (urgency === "urgent" || urgency === "high") {
          io.to(`urgency:${urgency}`).emit("newDemand", demand);
        }
      }

      // Populate buyer info
      const populated = await MarketDemand.findById(demand._id)
        .populate("buyerId", "name rating isVerified profilePicture");

      res.status(201).json(populated);
    } catch (err) {
      console.error("Error creating demand:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Could not create demand" });
    }
  }
);

// Fetch demands with advanced filtering - V0.8
router.get("/", async (req, res) => {
  try {
    const { 
      crop, 
      category,
      county, 
      town,
      minPrice, 
      maxPrice,
      minQuantity,
      maxQuantity,
      urgency,
      negotiable,
      verified,
      buyerId, // Filter by buyer ID
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const q = { status: "open" };
    
    if (crop) q.crop = new RegExp(crop, "i");
    if (category) q.category = category;
    if (county) q["location.county"] = new RegExp(county, "i");
    if (town) q["location.town"] = new RegExp(town, "i");
    if (urgency) q.urgency = urgency;
    if (minPrice || maxPrice) {
      q.priceOffer = {};
      if (minPrice) q.priceOffer.$gte = Number(minPrice);
      if (maxPrice) q.priceOffer.$lte = Number(maxPrice);
    }
    if (minQuantity || maxQuantity) {
      q.qtyKg = {};
      if (minQuantity) q.qtyKg.$gte = Number(minQuantity);
      if (maxQuantity) q.qtyKg.$lte = Number(maxQuantity);
    }
    if (negotiable !== undefined) q.isPriceNegotiable = negotiable === "true";
    if (buyerId) q.buyerId = buyerId;

    // Sorting
    let sort = { postedAt: -1 };
    if (sortBy === "price_asc") sort = { priceOffer: 1 };
    if (sortBy === "price_desc") sort = { priceOffer: -1 };
    if (sortBy === "newest") sort = { postedAt: -1 };
    if (sortBy === "urgency") sort = { urgency: -1, postedAt: -1 };
    if (sortBy === "quantity") sort = { qtyKg: -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    let query = MarketDemand.find(q)
      .populate("buyerId", "name rating isVerified profilePicture")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // If verified filter, add after populate
    if (verified === "true") {
      query = query.where("buyerId.isVerified").equals(true);
    }

    const demands = await query;
    const total = await MarketDemand.countDocuments(q);

    res.json({
      demands,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error("Error fetching demands:", err);
    res.status(500).json({ error: "Could not fetch demands" });
  }
});

// Get single demand
router.get("/:id", async (req, res) => {
  try {
    const demand = await MarketDemand.findById(req.params.id)
      .populate("buyerId", "name phone rating isVerified location");
    
    if (!demand) {
      return res.status(404).json({ error: "Demand not found" });
    }

    // Increment views
    demand.views += 1;
    await demand.save();

    res.json(demand);
  } catch (err) {
    console.error("Error fetching demand:", err);
    res.status(500).json({ error: "Could not fetch demand" });
  }
});

// Update demand (buyer only, owner only)
router.put(
  "/:id",
  requireAuth(),
  createOrGetLocalUser,
  requireRole("buyer"), // Only buyers can update demands
  async (req, res) => {
    try {
      const demand = await MarketDemand.findById(req.params.id);
      
      if (!demand) {
        return res.status(404).json({ error: "Demand not found" });
      }

      // Check ownership (owner or admin only)
      if (!isOwnerOrAdmin(req.localUser, demand.buyerId)) {
        return res.status(403).json({ error: "Not authorized to update this demand" });
      }

      // Update allowed fields
      const allowedUpdates = [
        "crop", "category", "qtyKg", "priceOffer", "isPriceNegotiable",
        "pickupWindow", "location", "urgency", "preferredPickupRadiusKm",
        "contactVisibility", "expiresAt"
      ];
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          demand[field] = req.body[field];
        }
      });

      await demand.save();
      res.json(demand);
    } catch (err) {
      console.error("Error updating demand:", err);
      res.status(500).json({ error: "Could not update demand" });
    }
  }
);

// Delete demand (buyer only, owner only)
router.delete(
  "/:id",
  requireAuth(),
  createOrGetLocalUser,
  requireRole("buyer"), // Only buyers can delete demands
  async (req, res) => {
    try {
      const demand = await MarketDemand.findById(req.params.id);
      
      if (!demand) {
        return res.status(404).json({ error: "Demand not found" });
      }

      // Check ownership (owner or admin only)
      if (!isOwnerOrAdmin(req.localUser, demand.buyerId)) {
        return res.status(403).json({ error: "Not authorized to delete this demand" });
      }

      await MarketDemand.findByIdAndDelete(req.params.id);
      res.json({ message: "Demand deleted successfully" });
    } catch (err) {
      console.error("Error deleting demand:", err);
      res.status(500).json({ error: "Could not delete demand" });
    }
  }
);

export default router;
