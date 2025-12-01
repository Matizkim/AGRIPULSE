// src/models/Match.js
import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  listingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ProduceListing", 
    required: true,
    index: true
  },
  demandId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "MarketDemand", 
    required: true,
    index: true
  },
  
  // Pricing
  priceAgreed: { type: Number, required: true },
  currency: { type: String, default: "KES" },
  
  // Participants
  initiatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  acceptedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    index: true
  },
  transportPoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TransportPool",
    index: true
  },
  driverAssignmentStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending"
  },
  driverAcceptedAt: Date,
  driverRejectedAt: Date,
  driverCancellationRequest: {
    requestedAt: Date,
    reason: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    status: { type: String, enum: ["pending", "approved", "rejected"] }
  },
  
  // Status lifecycle
  status: { 
    type: String, 
    enum: ["requested", "offered", "accepted", "driver_assigned", "driver_accepted", "in_transit", "completed", "cancelled", "expired", "driver_rejected"],
    default: "requested",
    index: true
  },
  
  // Transport
  transportBooked: { type: Boolean, default: false },
  transportDetails: {
    driverName: String,
    vehicleType: String,
    capacityKg: Number,
    pricePerKm: Number,
    estimatedCost: Number,
    pickupLocation: {
      county: String,
      town: String,
      lat: Number,
      lng: Number
    },
    dropoffLocation: {
      county: String,
      town: String,
      lat: Number,
      lng: Number
    },
    scheduledPickupTime: Date,
    // Real-time tracking
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date,
      address: String
    },
    trackingHistory: [{
      lat: Number,
      lng: Number,
      timestamp: Date,
      address: String
    }]
  },
  
  // Negotiation & events
  events: [{
    who: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    what: String, // "created", "accepted", "rejected", "message", etc.
    message: String,
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Partial fulfillment support
  quantityFulfilled: { type: Number, default: 0 },
  isPartialFulfillment: { type: Boolean, default: false },
  
  // Ratings (after completion)
  farmerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedAt: Date
  },
  buyerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    ratedAt: Date
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: Date, // Auto-expire if not acted upon
  completedAt: Date
});

// Compound indexes
matchSchema.index({ listingId: 1, demandId: 1 }, { unique: true }); // Prevent duplicates
matchSchema.index({ initiatedBy: 1, status: 1 });
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ expiresAt: 1 }); // For auto-expiry

// Update updatedAt on save
matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Match", matchSchema);
