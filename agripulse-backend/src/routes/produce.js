// src/routes/produce.js
import express from "express";
import ProduceListing from "../models/ProduceListing.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";
import { requireRole, requireOwner, isOwnerOrAdmin, requireVerification } from "../utils/authorization.js";
import { validateRequired, validateEnum, validateNumberRange, isValidObjectId } from "../utils/validation.js";

const router = express.Router();

// Create listing (farmer only) - V0.8: Uses local User ObjectId
router.post(
  "/",
  requireAuth(),
  createOrGetLocalUser,
  requireVerification(), // Must be verified
  requireRole("farmer"), // Only farmers can post produce
  validateRequired(["crop", "quantityKg", "location"]),
  validateEnum("category", ["vegetables", "fruits", "cereals", "legumes", "roots", "other"]),
  validateNumberRange("quantityKg", 0),
  validateNumberRange("expectedPrice", 0),
  async (req, res) => {
    try {
      const { 
        crop, 
        category,
        quantityKg, 
        harvestDate, 
        readyDate,
        expectedPrice, 
        isPriceNegotiable,
        location,
        images,
        visibility
      } = req.body;

      // Use local User ObjectId (not Clerk ID)
      const listing = await ProduceListing.create({
        farmerId: req.localUser._id,
        crop,
        category: category || "other",
        quantityKg,
        harvestDate: harvestDate ? new Date(harvestDate) : undefined,
        readyDate: readyDate ? new Date(readyDate) : undefined,
        expectedPrice,
        isPriceNegotiable: isPriceNegotiable !== undefined ? isPriceNegotiable : true,
        location: {
          county: location?.county || location?.county,
          town: location?.town,
          lat: location?.lat,
          lng: location?.lng
        },
        images: images || [],
        visibility: visibility || "public",
        status: "available"
      });

      // Emit Socket.IO event for real-time updates
      const io = req.app.get("io");
      if (io) {
        // Emit to all clients
        io.emit("newListing", listing);
        // Also emit to location-specific room (e.g., "Nairobi:tomatoes")
        if (location?.county && crop) {
          const room = `${location.county}:${crop}`.toLowerCase();
          io.to(room).emit("newListing", listing);
        }
        // Emit to category room
        if (category) {
          const categoryRoom = `category:${category}`.toLowerCase();
          io.to(categoryRoom).emit("newListing", listing);
        }
      }

      // Populate farmer info
      const populated = await ProduceListing.findById(listing._id)
        .populate("farmerId", "name rating isVerified profilePicture");

      res.status(201).json(populated);
    } catch (err) {
      console.error("Error creating listing:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Could not create listing" });
    }
  }
);

// Get listings with advanced filtering - V0.8
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
      negotiable,
      verified,
      promoted,
      farmerId, // Filter by farmer ID
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const q = { status: "available" };
    
    if (crop) q.crop = new RegExp(crop, "i"); // Case-insensitive search
    if (category) q.category = category;
    if (county) q["location.county"] = new RegExp(county, "i");
    if (town) q["location.town"] = new RegExp(town, "i");
    if (minPrice || maxPrice) {
      q.expectedPrice = {};
      if (minPrice) q.expectedPrice.$gte = Number(minPrice);
      if (maxPrice) q.expectedPrice.$lte = Number(maxPrice);
    }
    if (minQuantity || maxQuantity) {
      q.quantityKg = {};
      if (minQuantity) q.quantityKg.$gte = Number(minQuantity);
      if (maxQuantity) q.quantityKg.$lte = Number(maxQuantity);
    }
    if (negotiable !== undefined) q.isPriceNegotiable = negotiable === "true";
    if (promoted === "true") q.isPromoted = true;
    if (farmerId) q.farmerId = farmerId;

    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (sortBy === "price_asc") sort = { expectedPrice: 1 };
    if (sortBy === "price_desc") sort = { expectedPrice: -1 };
    if (sortBy === "newest") sort = { createdAt: -1 };
    if (sortBy === "quantity") sort = { quantityKg: -1 };
    if (sortBy === "promoted") sort = { isPromoted: -1, createdAt: -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    let query = ProduceListing.find(q)
      .populate("farmerId", "name rating isVerified profilePicture")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // If verified filter, add after populate
    if (verified === "true") {
      query = query.where("farmerId.isVerified").equals(true);
    }

    const listings = await query;
    const total = await ProduceListing.countDocuments(q);

    res.json({
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ error: "Could not fetch listings" });
  }
});

// Get single listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await ProduceListing.findById(req.params.id)
      .populate("farmerId", "name phone rating isVerified location profilePicture");
    
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).json({ error: "Could not fetch listing" });
  }
});

// Update listing (farmer only, owner only) - with approval workflow
router.put(
  "/:id",
  requireAuth(),
  createOrGetLocalUser,
  requireVerification(), // Must be verified
  requireRole("farmer"), // Only farmers can update produce listings
  async (req, res) => {
    try {
      const listing = await ProduceListing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Check ownership (owner or admin only)
      if (!isOwnerOrAdmin(req.localUser, listing.farmerId)) {
        return res.status(403).json({ error: "Not authorized to update this listing" });
      }

      // If admin, update directly
      const isAdmin = req.localUser.roles?.includes("admin");
      
      if (isAdmin) {
        // Admin can update directly
        const allowedUpdates = [
          "crop", "category", "quantityKg", "harvestDate", "readyDate",
          "expectedPrice", "isPriceNegotiable", "location", "images", "visibility"
        ];
        
        allowedUpdates.forEach(field => {
          if (req.body[field] !== undefined) {
            listing[field] = req.body[field];
          }
        });

        await listing.save();
        return res.json(listing);
      }

      // For regular farmers, create pending edit request
      const changes = {};
      const allowedUpdates = [
        "crop", "category", "quantityKg", "harvestDate", "readyDate",
        "expectedPrice", "isPriceNegotiable", "location", "images", "visibility"
      ];
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== listing[field]) {
          changes[field] = req.body[field];
        }
      });

      if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: "No changes detected" });
      }

      // Create pending edit request
      listing.pendingEdit = {
        changes,
        requestedAt: new Date(),
        requestedBy: req.localUser._id,
        status: "pending"
      };

      await listing.save();
      res.json({ 
        message: "Edit request submitted. Waiting for admin approval.",
        listing,
        pendingEdit: listing.pendingEdit
      });
    } catch (err) {
      console.error("Error updating listing:", err);
      res.status(500).json({ error: "Could not update listing" });
    }
  }
);

// Approve/reject edit request (admin only)
router.post(
  "/:id/approve-edit",
  requireAuth(),
  createOrGetLocalUser,
  requireRole("admin"),
  async (req, res) => {
    try {
      const listing = await ProduceListing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      if (!listing.pendingEdit || listing.pendingEdit.status !== "pending") {
        return res.status(400).json({ error: "No pending edit request" });
      }

      const { approve } = req.body;

      if (approve) {
        // Apply changes
        Object.keys(listing.pendingEdit.changes).forEach(field => {
          listing[field] = listing.pendingEdit.changes[field];
        });
        
        listing.pendingEdit.status = "approved";
        listing.pendingEdit.approvedAt = new Date();
        listing.pendingEdit.approvedBy = req.localUser._id;
      } else {
        listing.pendingEdit.status = "rejected";
        listing.pendingEdit.approvedAt = new Date();
        listing.pendingEdit.approvedBy = req.localUser._id;
      }

      await listing.save();
      res.json(listing);
    } catch (err) {
      console.error("Error processing edit approval:", err);
      res.status(500).json({ error: "Could not process edit approval" });
    }
  }
);

// Delete listing (farmer only, owner only)
router.delete(
  "/:id",
  requireAuth(),
  createOrGetLocalUser,
  requireRole("farmer"), // Only farmers can delete produce listings
  async (req, res) => {
    try {
      const listing = await ProduceListing.findById(req.params.id);
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Check ownership (owner or admin only)
      if (!isOwnerOrAdmin(req.localUser, listing.farmerId)) {
        return res.status(403).json({ error: "Not authorized to delete this listing" });
      }

      await ProduceListing.findByIdAndDelete(req.params.id);
      res.json({ message: "Listing deleted successfully" });
    } catch (err) {
      console.error("Error deleting listing:", err);
      res.status(500).json({ error: "Could not delete listing" });
    }
  }
);

export default router;
