// src/routes/transport.js
import express from "express";
import TransportPool from "../models/TransportPool.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";
import { requireRole, isOwnerOrAdmin, requireVerification } from "../utils/authorization.js";
import { validateRequired, validateEnum, validateNumberRange } from "../utils/validation.js";

const router = express.Router();

// Create transport availability (driver only)
router.post(
  "/",
  requireAuth(),
  createOrGetLocalUser,
  requireVerification(), // Must be verified
  requireRole("driver"), // Only drivers can post transport
  validateRequired(["vehicleType", "capacityKg", "pricePerKm"]),
  validateEnum("vehicleType", ["truck", "van", "motorcycle", "bicycle", "other"]),
  validateNumberRange("capacityKg", 0),
  validateNumberRange("pricePerKm", 0),
  async (req, res) => {
    try {
      const userId = req.localUser._id;

      const {
        vehicleType,
        vehicleRegistration,
        capacityKg,
        availableFrom,
        availableUntil,
        route,
        origin,
        destination,
        servesCounties,
        pricePerKm,
        minimumCharge,
        vehicleImage
      } = req.body;

      const transport = await TransportPool.create({
        driverId: userId,
        vehicleType,
        vehicleRegistration,
        capacityKg,
        availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
        availableUntil: availableUntil ? new Date(availableUntil) : undefined,
        route,
        origin,
        destination,
        servesCounties: servesCounties || [],
        pricePerKm,
        minimumCharge,
        vehicleImage: vehicleImage || null,
        isAvailable: true,
        status: "available"
      });

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.emit("newTransport", transport);
      }

      const populated = await TransportPool.findById(transport._id)
        .populate("driverId", "name phone rating profilePicture");

      res.status(201).json(populated);
    } catch (err) {
      console.error("Error creating transport:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Could not create transport availability" });
    }
  }
);

// Get available transport with filters
router.get("/", async (req, res) => {
  try {
    const {
      originCounty,
      destinationCounty,
      minCapacity,
      maxPricePerKm,
      vehicleType,
      availableFrom,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const q = { 
      isAvailable: true,
      status: "available"
    };

    if (originCounty) {
      q.$or = [
        { "origin.county": new RegExp(originCounty, "i") },
        { servesCounties: new RegExp(originCounty, "i") }
      ];
    }
    if (destinationCounty) {
      if (q.$or) {
        q.$and = [
          { $or: q.$or },
          { $or: [
            { "destination.county": new RegExp(destinationCounty, "i") },
            { servesCounties: new RegExp(destinationCounty, "i") }
          ]}
        ];
        delete q.$or;
      } else {
        q.$or = [
          { "destination.county": new RegExp(destinationCounty, "i") },
          { servesCounties: new RegExp(destinationCounty, "i") }
        ];
      }
    }
    if (minCapacity) {
      q.capacityKg = { $gte: Number(minCapacity) };
    }
    if (maxPricePerKm) {
      q.pricePerKm = { $lte: Number(maxPricePerKm) };
    }
    if (vehicleType) {
      q.vehicleType = vehicleType;
    }
    if (availableFrom) {
      q.availableFrom = { $lte: new Date(availableFrom) };
      if (q.availableUntil) {
        q.availableUntil = { $gte: new Date(availableFrom) };
      }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const transports = await TransportPool.find(q)
      .populate("driverId", "name phone rating isVerified profilePicture")
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await TransportPool.countDocuments(q);

    res.json({
      transports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error("Error fetching transport:", err);
    res.status(500).json({ error: "Could not fetch transport" });
  }
});

// Get suggested drivers for a match - V0.9
router.get("/suggest/:matchId", async (req, res) => {
  try {
    const Match = (await import("../models/Match.js")).default;
    const ProduceListing = (await import("../models/ProduceListing.js")).default;
    const MarketDemand = (await import("../models/MarketDemand.js")).default;
    
    const match = await Match.findById(req.params.matchId)
      .populate("listingId")
      .populate("demandId");
    
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    
    const origin = match.listingId?.location;
    const destination = match.demandId?.location;
    const requiredCapacity = Math.min(
      match.listingId?.quantityKg || 100,
      match.demandId?.qtyKg || 100
    );
    
    const baseQuery = {
      isAvailable: true,
      status: "available",
      capacityKg: { $gte: requiredCapacity }
    };
    
    let regionalDrivers = [];
    let otherDrivers = [];
    let searchExpanded = false;
    let message = "";
    
    // Step 1: Try to find drivers in the same region (origin or destination county)
    if (origin?.county || destination?.county) {
      const targetCounties = [];
      if (origin?.county) targetCounties.push(new RegExp(origin.county, "i"));
      if (destination?.county) targetCounties.push(new RegExp(destination.county, "i"));
      
      const regionalQuery = {
        ...baseQuery,
        $or: [
          { "origin.county": { $in: targetCounties } },
          { "destination.county": { $in: targetCounties } },
          { servesCounties: { $in: targetCounties } }
        ]
      };
      
      regionalDrivers = await TransportPool.find(regionalQuery)
        .populate("driverId", "name phone rating isVerified profilePicture location")
        .sort({ rating: -1, pricePerKm: 1 })
        .limit(10);
      
      // Step 2: If no regional drivers found, expand search to all available drivers
      if (regionalDrivers.length === 0) {
        searchExpanded = true;
        message = `No drivers found in ${origin?.county || 'origin'} or ${destination?.county || 'destination'} region. Showing drivers from other regions:`;
        
        otherDrivers = await TransportPool.find(baseQuery)
          .populate("driverId", "name phone rating isVerified profilePicture location")
          .sort({ rating: -1, pricePerKm: 1 })
          .limit(10);
      } else {
        // Step 3: If regional drivers found, also get some from other regions as backup
        const otherQuery = {
          ...baseQuery,
          $nor: [
            { "origin.county": { $in: targetCounties } },
            { "destination.county": { $in: targetCounties } },
            { servesCounties: { $in: targetCounties } }
          ]
        };
        
        otherDrivers = await TransportPool.find(otherQuery)
          .populate("driverId", "name phone rating isVerified profilePicture location")
          .sort({ rating: -1, pricePerKm: 1 })
          .limit(5);
      }
    } else {
      // If no location info, just get all available drivers
      otherDrivers = await TransportPool.find(baseQuery)
        .populate("driverId", "name phone rating isVerified profilePicture location")
        .sort({ rating: -1, pricePerKm: 1 })
        .limit(10);
      message = "Showing all available drivers:";
    }
    
    res.json({ 
      regionalDrivers,
      otherDrivers,
      searchExpanded,
      message,
      matchInfo: {
        origin: origin,
        destination: destination,
        requiredCapacity
      }
    });
  } catch (err) {
    console.error("Error suggesting drivers:", err);
    res.status(500).json({ error: "Could not suggest drivers" });
  }
});

// Get transport by driver
router.get("/driver/:driverId", async (req, res) => {
  try {
    const transports = await TransportPool.find({ driverId: req.params.driverId })
      .populate("driverId", "name phone rating")
      .sort({ createdAt: -1 });

    res.json(transports);
  } catch (err) {
    console.error("Error fetching driver transport:", err);
    res.status(500).json({ error: "Could not fetch transport" });
  }
});

// Update transport availability (driver only, owner only)
router.put(
  "/:id",
  requireAuth(),
  createOrGetLocalUser,
  requireRole("driver"), // Only drivers can update transport
  async (req, res) => {
    try {
      const transport = await TransportPool.findById(req.params.id);
      
      if (!transport) {
        return res.status(404).json({ error: "Transport not found" });
      }

      // Check ownership (owner or admin only)
      if (!isOwnerOrAdmin(req.localUser, transport.driverId)) {
        return res.status(403).json({ error: "Not authorized to update this transport" });
      }

      // Update allowed fields
      const allowedUpdates = [
        "vehicleType", "vehicleRegistration", "capacityKg",
        "availableFrom", "availableUntil", "route",
        "origin", "destination", "servesCounties",
        "pricePerKm", "minimumCharge", "isAvailable", "status"
      ];
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          transport[field] = req.body[field];
        }
      });

      await transport.save();

      const populated = await TransportPool.findById(transport._id)
        .populate("driverId", "name phone rating profilePicture");

      res.json(populated);
    } catch (err) {
      console.error("Error updating transport:", err);
      res.status(500).json({ error: "Could not update transport" });
    }
  }
);

// Delete transport (driver only, owner only)
router.delete(
  "/:id",
  requireAuth(),
  createOrGetLocalUser,
  requireRole("driver"), // Only drivers can delete transport
  async (req, res) => {
    try {
      const transport = await TransportPool.findById(req.params.id);
      
      if (!transport) {
        return res.status(404).json({ error: "Transport not found" });
      }

      // Check ownership (owner or admin only)
      if (!isOwnerOrAdmin(req.localUser, transport.driverId)) {
        return res.status(403).json({ error: "Not authorized to delete this transport" });
      }

      await TransportPool.findByIdAndDelete(req.params.id);
      res.json({ message: "Transport deleted successfully" });
    } catch (err) {
      console.error("Error deleting transport:", err);
      res.status(500).json({ error: "Could not delete transport" });
    }
  }
);

export default router;

