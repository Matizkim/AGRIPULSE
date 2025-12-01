// src/models/MarketDemand.js
import mongoose from "mongoose";

const demandSchema = new mongoose.Schema({
  // Use local User ObjectId (not Clerk ID)
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  
  // Crop information
  crop: { type: String, required: true, index: true },
  category: { type: String, enum: ["vegetables", "fruits", "cereals", "legumes", "roots", "other"], index: true },
  qtyKg: { type: Number, required: true, min: 0 },
  
  // Pricing
  priceOffer: Number,
  isPriceNegotiable: { type: Boolean, default: true },
  currency: { type: String, default: "KES" },
  
  // Timing & urgency
  pickupWindow: { 
    start: Date, 
    end: Date 
  },
  urgency: { 
    type: String, 
    enum: ["low", "medium", "high", "urgent"], 
    default: "medium" 
  },
  
  // Location
  location: { 
    county: { type: String, required: true, index: true },
    subcounty: String,
    town: { type: String, required: true },
    lat: Number,
    lng: Number
  },
  preferredPickupRadiusKm: { type: Number, default: 50 }, // Within X km
  
  // Media
  images: [{ type: String }], // URLs to images (reference images for what buyer needs)
  
  // Contact visibility
  contactVisibility: {
    type: String,
    enum: ["hidden", "on_match", "public"],
    default: "on_match"
  },
  
  // Status
  status: { 
    type: String, 
    enum: ["open", "fulfilled", "expired", "cancelled"], 
    default: "open",
    index: true
  },
  
  // Metadata
  postedAt: { type: Date, default: Date.now, index: true },
  expiresAt: Date,
  views: { type: Number, default: 0 },
  matchesCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// Compound indexes for common queries
demandSchema.index({ crop: 1, "location.county": 1, status: 1 });
demandSchema.index({ buyerId: 1, status: 1 });
demandSchema.index({ postedAt: -1 });
demandSchema.index({ urgency: 1, postedAt: -1 }); // For urgent demands

// Auto-expire demands
demandSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("MarketDemand", demandSchema);
