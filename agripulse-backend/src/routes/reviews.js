// src/routes/reviews.js
import express from "express";
import Review from "../models/Review.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";
import { validateRequired, validateParamObjectId, validateNumberRange } from "../utils/validation.js";

const router = express.Router();

// Create review (after match completion)
router.post(
  "/",
  requireAuth(),
  createOrGetLocalUser,
  validateRequired(["matchId", "rating"]),
  validateParamObjectId("matchId"),
  validateNumberRange("rating", 1, 5),
  async (req, res) => {
    try {
      const { matchId, rating, comment, categories } = req.body;
      const userId = req.localUser._id;

      // Verify match exists and is completed
      const match = await Match.findById(matchId)
        .populate("listingId")
        .populate("demandId");

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      if (match.status !== "completed") {
        return res.status(400).json({ error: "Can only review completed matches" });
      }

      // Determine who is being reviewed
      const isFarmer = match.listingId.farmerId.toString() === userId.toString();
      const isBuyer = match.demandId.buyerId.toString() === userId.toString();

      if (!isFarmer && !isBuyer) {
        return res.status(403).json({ error: "Not authorized to review this match" });
      }

      // Determine reviewed user
      const reviewedUserId = isFarmer 
        ? match.demandId.buyerId 
        : match.listingId.farmerId;

      // Check if review already exists
      const existingReview = await Review.findOne({
        matchId,
        reviewer: userId
      });

      if (existingReview) {
        return res.status(400).json({ error: "Review already exists for this match" });
      }

      // Create review
      const review = await Review.create({
        matchId,
        reviewer: userId,
        reviewed: reviewedUserId,
        rating,
        comment,
        categories
      });

      // Update user rating
      const reviewedUser = await User.findById(reviewedUserId);
      if (reviewedUser) {
        const totalReviews = reviewedUser.reviewsCount + 1;
        const currentTotal = reviewedUser.rating * reviewedUser.reviewsCount;
        reviewedUser.rating = (currentTotal + rating) / totalReviews;
        reviewedUser.reviewsCount = totalReviews;
        await reviewedUser.save();
      }

      // Update match with rating
      if (isFarmer) {
        match.buyerRating = { rating, comment, ratedAt: new Date() };
      } else {
        match.farmerRating = { rating, comment, ratedAt: new Date() };
      }
      await match.save();

      const populated = await Review.findById(review._id)
        .populate("reviewer", "name")
        .populate("reviewed", "name");

      res.status(201).json(populated);
    } catch (err) {
      console.error("Error creating review:", err);
      if (err.code === 11000) {
        return res.status(400).json({ error: "Review already exists" });
      }
      res.status(500).json({ error: "Could not create review" });
    }
  }
);

// Get reviews for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewed: userId })
      .populate("reviewer", "name")
      .populate("matchId", "listingId demandId")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Could not fetch reviews" });
  }
});

// Get reviews for a match
router.get("/match/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const reviews = await Review.find({ matchId })
      .populate("reviewer", "name")
      .populate("reviewed", "name");

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Could not fetch reviews" });
  }
});

export default router;

