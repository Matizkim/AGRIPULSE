// src/routes/produce.js
import express from "express";
import ProduceListing from "../models/ProduceListing.js";
import { requireAuth, mapReqAuthToReqUser } from "../utils/clerkVerify.js";

const router = express.Router();

// Create listing (farmer)
router.post("/", requireAuth(), mapReqAuthToReqUser, async (req, res) => {
//import { fakeAuth } from "../utils/fakeAuth.js";
//router.post("/", fakeAuth, async (req, res) => {

  try {
    const { crop, quantityKg, harvestDate, expectedPrice, location } = req.body;

    const listing = await ProduceListing.create({
      farmerId: req.user.userId, // still Clerk userId for MVP
      crop,
      quantityKg,
      harvestDate,
      expectedPrice,
      location,
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
    }

    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create listing" });
  }
});

// Get listings
router.get("/", async (req, res) => {
  try {
    const { crop, county } = req.query;
    const q = {};
    if (crop) q.crop = crop;
    if (county) q["location.county"] = county;

    const listings = await ProduceListing.find(q).sort({ createdAt: -1 }).limit(100);
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch listings" });
  }
});

export default router;
