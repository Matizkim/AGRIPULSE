// src/routes/matching.js
import express from "express";
import ProduceListing from "../models/ProduceListing.js";
import MarketDemand from "../models/MarketDemand.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";

const router = express.Router();

/**
 * Simple matching algorithm - V0.8
 * Finds best matches for a demand or listing
 */
router.get("/suggestions", requireAuth(), createOrGetLocalUser, async (req, res) => {
  try {
    const { 
      type, // "forDemand" or "forListing"
      demandId, // If type is "forDemand"
      listingId, // If type is "forListing"
      limit = 10
    } = req.query;

    let suggestions = [];

    if (type === "forDemand" && demandId) {
      // Find listings that match a demand
      const demand = await MarketDemand.findById(demandId);
      if (!demand) {
        return res.status(404).json({ error: "Demand not found" });
      }

      // Build query
      const query = {
        status: "available",
        crop: new RegExp(demand.crop, "i"),
        quantityKg: { $gte: demand.qtyKg }, // At least the required quantity
      };

      // Location matching
      if (demand.location?.county) {
        query["location.county"] = new RegExp(demand.location.county, "i");
      }

      // Price matching
      if (demand.priceOffer) {
        query.$or = [
          { expectedPrice: { $lte: demand.priceOffer } },
          { isPriceNegotiable: true }
        ];
      }

      const listings = await ProduceListing.find(query)
        .populate("farmerId", "name rating isVerified")
        .sort({ 
          // Sort by: promoted first, then by rating, then by newest
          isPromoted: -1,
          "farmerId.rating": -1,
          createdAt: -1
        })
        .limit(Number(limit));

      // Score and rank
      suggestions = listings.map(listing => {
        let score = 0;
        
        // Exact crop match
        if (listing.crop.toLowerCase() === demand.crop.toLowerCase()) {
          score += 10;
        }
        
        // Location match
        if (listing.location?.county === demand.location?.county) {
          score += 5;
        }
        
        // Price compatibility
        if (listing.expectedPrice && demand.priceOffer) {
          if (listing.expectedPrice <= demand.priceOffer) {
            score += 3;
          }
        }
        
        // Verified seller
        if (listing.farmerId?.isVerified) {
          score += 2;
        }
        
        // High rating
        if (listing.farmerId?.rating >= 4) {
          score += 2;
        }
        
        // Promoted
        if (listing.isPromoted) {
          score += 1;
        }

        return {
          listing,
          score,
          matchReasons: [
            listing.crop.toLowerCase() === demand.crop.toLowerCase() ? "Exact crop match" : null,
            listing.location?.county === demand.location?.county ? "Same county" : null,
            listing.expectedPrice && demand.priceOffer && listing.expectedPrice <= demand.priceOffer ? "Price compatible" : null,
            listing.farmerId?.isVerified ? "Verified seller" : null
          ].filter(Boolean)
        };
      }).sort((a, b) => b.score - a.score);

    } else if (type === "forListing" && listingId) {
      // Find demands that match a listing
      const listing = await ProduceListing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      const query = {
        status: "open",
        crop: new RegExp(listing.crop, "i"),
        qtyKg: { $lte: listing.quantityKg }, // Demand needs less or equal to available
      };

      // Location matching
      if (listing.location?.county) {
        query["location.county"] = new RegExp(listing.location.county, "i");
      }

      // Price matching
      if (listing.expectedPrice) {
        query.$or = [
          { priceOffer: { $gte: listing.expectedPrice } },
          { isPriceNegotiable: true }
        ];
      }

      const demands = await MarketDemand.find(query)
        .populate("buyerId", "name rating isVerified")
        .sort({ 
          urgency: -1, // Urgent first
          postedAt: -1
        })
        .limit(Number(limit));

      // Score and rank
      suggestions = demands.map(demand => {
        let score = 0;
        
        // Exact crop match
        if (demand.crop.toLowerCase() === listing.crop.toLowerCase()) {
          score += 10;
        }
        
        // Location match
        if (demand.location?.county === listing.location?.county) {
          score += 5;
        }
        
        // Urgency
        if (demand.urgency === "urgent") score += 5;
        else if (demand.urgency === "high") score += 3;
        
        // Price compatibility
        if (demand.priceOffer && listing.expectedPrice) {
          if (demand.priceOffer >= listing.expectedPrice) {
            score += 3;
          }
        }
        
        // Verified buyer
        if (demand.buyerId?.isVerified) {
          score += 2;
        }

        return {
          demand,
          score,
          matchReasons: [
            demand.crop.toLowerCase() === listing.crop.toLowerCase() ? "Exact crop match" : null,
            demand.location?.county === listing.location?.county ? "Same county" : null,
            demand.urgency === "urgent" ? "Urgent demand" : null,
            demand.buyerId?.isVerified ? "Verified buyer" : null
          ].filter(Boolean)
        };
      }).sort((a, b) => b.score - a.score);
    } else {
      return res.status(400).json({ 
        error: "Invalid parameters. Provide type (forDemand/forListing) and corresponding ID" 
      });
    }

    res.json({ suggestions });
  } catch (err) {
    console.error("Error finding matches:", err);
    res.status(500).json({ error: "Could not find matches" });
  }
});

export default router;

