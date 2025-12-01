// src/models/ProduceListing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  // Use local User ObjectId (not Clerk ID)
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  
  // Crop information
  crop: { type: String, required: true, index: true },
  category: { type: String, enum: ["vegetables", "fruits", "cereals", "legumes", "roots", "other"], index: true },
  quantityKg: { type: Number, required: true, min: 0 },
  
  // Pricing
  expectedPrice: Number,
  isPriceNegotiable: { type: Boolean, default: true },
  currency: { type: String, default: "KES" },
  
  // Timing
  harvestDate: Date,
  readyDate: Date, // When produce will be ready
  
  // Location
  location: {
    county: { type: String, required: true, index: true },
    subcounty: String,
    town: { type: String, required: true },
    lat: Number,
    lng: Number
  },
  
  // Media
  images: [{ type: String }], // URLs to images
  
  // Status & visibility
  status: { 
    type: String, 
    enum: ["available", "matched", "sold", "expired"], 
    default: "available",
    index: true
  },
  visibility: { 
    type: String, 
    enum: ["public", "private", "premium"], 
    default: "public" 
  },
  
  // Premium features
  isPromoted: { type: Boolean, default: false },
  promotedUntil: Date,
  
  // Edit approval workflow
  pendingEdit: {
    changes: mongoose.Schema.Types.Mixed, // Proposed changes
    requestedAt: Date,
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  
  // Metadata
  views: { type: Number, default: 0 },
  matchesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Compound indexes for common queries
listingSchema.index({ crop: 1, "location.county": 1, status: 1 });
listingSchema.index({ farmerId: 1, status: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ isPromoted: -1, createdAt: -1 }); // For promoted listings

// Update updatedAt on save
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("ProduceListing", listingSchema);
