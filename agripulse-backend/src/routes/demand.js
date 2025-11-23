  // src/routes/demand.js
  import express from "express";
  import MarketDemand from "../models/MarketDemand.js";
  import { requireAuth, mapReqAuthToReqUser } from "../utils/clerkVerify.js";

  const router = express.Router();

  // Create market demand
  router.post("/", requireAuth(), mapReqAuthToReqUser, async (req, res) => {
    //import { fakeAuth } from "../utils/fakeAuth.js";
  //router.post("/", fakeAuth, async (req, res) => {

    try {
      const { crop, qtyKg, priceOffer, pickupWindow, location, expiresAt } = req.body;

      const demand = await MarketDemand.create({
        buyerId: req.user.userId,
        crop,
        qtyKg,
        priceOffer,
        pickupWindow,
        location,
        expiresAt,
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
      }

      res.status(201).json(demand);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not create demand" });
    }
  });

  // Fetch demands
  router.get("/", async (req, res) => {
    try {
      const { crop, county } = req.query;

      const q = { status: "open" };
      if (crop) q.crop = crop;
      if (county) q["location.county"] = county;

      const results = await MarketDemand.find(q).sort({ postedAt: -1 }).limit(100);
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not fetch demands" });
    }
  });

  export default router;
