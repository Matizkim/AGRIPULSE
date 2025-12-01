// src/models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // Match this review is for
  matchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Match", 
    required: true,
    index: true
  },
  
  // Who is reviewing and who is being reviewed
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  reviewed: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  
  // Rating
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    index: true
  },
  
  // Review content
  comment: String,
  
  // Categories (optional)
  categories: {
    communication: Number, // 1-5
    timeliness: Number,
    quality: Number,
    reliability: Number
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate reviews for same match
reviewSchema.index({ matchId: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewed: 1, rating: -1 });

export default mongoose.model("Review", reviewSchema);

