// src/routes/match.js
import express from "express";
import Match from "../models/Match.js";
import ProduceListing from "../models/ProduceListing.js";
import MarketDemand from "../models/MarketDemand.js";
import { requireAuth, mapReqAuthToReqUser } from "../utils/clerkVerify.js";

const router = express.Router();


// =====================
// GET ALL MATCHES
// =====================
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("listingId")
      .populate("demandId")
      .sort({ createdAt: -1 });

    // Convert to frontend-friendly format
    const formatted = matches.map((m) => ({
      _id: m._id,
      priceAgreed: m.priceAgreed,
      listing: m.listingId,
      demand: m.demandId,
      createdAt: m.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch matches" });
  }
});


// =====================
// CREATE MATCH
// =====================
router.post("/", requireAuth(), mapReqAuthToReqUser, async (req, res) => {
  try {
    const { listingId, demandId, priceAgreed } = req.body;

    const match = await Match.create({
      listingId,
      demandId,
      priceAgreed,
    });

    // Update statuses
    await ProduceListing.findByIdAndUpdate(listingId, { status: "matched" });
    await MarketDemand.findByIdAndUpdate(demandId, { status: "fulfilled" });

    // Return populated match
    const populated = await Match.findById(match._id)
      .populate("listingId")
      .populate("demandId");

    const matchResponse = {
      _id: populated._id,
      priceAgreed: populated.priceAgreed,
      listing: populated.listingId,
      demand: populated.demandId,
      createdAt: populated.createdAt,
    };

    // Emit Socket.IO event for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.emit("newMatch", matchResponse);
    }

    res.status(201).json(matchResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create match" });
  }
});

export default router;
