// src/routes/match.js
import express from "express";
import Match from "../models/Match.js";
import ProduceListing from "../models/ProduceListing.js";
import MarketDemand from "../models/MarketDemand.js";
import { requireAuth, mapReqAuthToReqUser } from "../utils/clerkVerify.js";

const router = express.Router();

// Create a match (farmer responds to demand)
router.post("/", requireAuth(), mapReqAuthToReqUser, async (req, res) => {
//import { fakeAuth } from "../utils/fakeAuth.js";
// router.post("/", fakeAuth, async (req, res) => {

  try {
    const { listingId, demandId, priceAgreed } = req.body;

    const match = await Match.create({
      listingId,
      demandId,
      priceAgreed,
    });

    await ProduceListing.findByIdAndUpdate(listingId, { status: "matched" });
    await MarketDemand.findByIdAndUpdate(demandId, { status: "fulfilled" });

    res.status(201).json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create match" });
  }
});

export default router;
