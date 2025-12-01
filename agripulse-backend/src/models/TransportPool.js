// src/models/TransportPool.js
import mongoose from "mongoose";

const transportSchema = new mongoose.Schema({
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  
  // Vehicle information
  vehicleType: { 
    type: String, 
    enum: ["truck", "van", "motorcycle", "bicycle", "other"],
    required: true
  },
  vehicleRegistration: String,
  vehicleImage: String, // URL to truck/vehicle picture
  
  // Capacity
  capacityKg: { 
    type: Number, 
    required: true,
    min: 0
  },
  
  // Availability
  availableFrom: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  availableUntil: Date,
  isAvailable: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Route information
  route: String, // e.g., "Nairobi-Nakuru"
  origin: {
    county: String,
    town: String,
    lat: Number,
    lng: Number
  },
  destination: {
    county: String,
    town: String,
    lat: Number,
    lng: Number
  },
  servesCounties: [{ type: String }], // Array of counties served
  
  // Pricing
  pricePerKm: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: { type: String, default: "KES" },
  minimumCharge: Number,
  
  // Status
  status: { 
    type: String, 
    enum: ["available", "booked", "in_transit", "unavailable"],
    default: "available",
    index: true
  },
  
  // Metadata
  completedTrips: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
transportSchema.index({ driverId: 1, status: 1 });
transportSchema.index({ "origin.county": 1, "destination.county": 1 });
transportSchema.index({ isAvailable: 1, availableFrom: 1 });
transportSchema.index({ servesCounties: 1 });

// Update updatedAt on save
transportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("TransportPool", transportSchema);
