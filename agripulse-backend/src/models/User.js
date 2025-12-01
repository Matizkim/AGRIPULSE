// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  name: String,
  email: String,
  phone: String,
  profilePicture: String, // URL to profile picture
  bio: String, // Optional bio/description
  roles: [{ type: String, enum: ["farmer", "buyer", "driver", "admin"] }], // Multiple roles support
  primaryRole: { type: String, enum: ["farmer", "buyer", "driver", "admin"] }, // No default - must be selected
  location: {
    country: { type: String, default: "Kenya" },
    county: String,
    town: String,
    lat: Number,
    lng: Number
  },
  // Trust & verification
  isPhoneVerified: { type: Boolean, default: false },
  isIdVerified: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // Overall verified badge (admin approval)
  verificationStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  }, // Admin verification status
  verificationRejectedReason: String, // Reason if rejected
  verificationRetryCount: { type: Number, default: 0 }, // Number of times user has resubmitted after rejection
  
  // Legal details for verification
  legalDetails: {
    nationalId: String, // National ID number
    nationalIdImage: String, // URL to uploaded ID image
    // Additional documents can be added later
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Admin who reviewed
  },
  // Ratings
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  // Premium features
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: Date,
  // Subscription tier
  tier: { 
    type: String, 
    required: false,
    default: undefined,
    validate: {
      validator: function(value) {
        // Allow undefined/null (not selected yet)
        if (value === null || value === undefined || value === '') {
          return true;
        }
        // Validate enum values only when a value is provided
        return ["basic", "pro", "business"].includes(value);
      },
      message: "Tier must be one of: basic, pro, business"
    }
  }, // undefined/null means not selected yet
  // Metadata
  lastActiveAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
userSchema.index({ clerkId: 1 });
userSchema.index({ "location.county": 1 });
userSchema.index({ rating: -1 });
userSchema.index({ isVerified: 1 });

// Update updatedAt on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Handle tier field - convert null/empty to undefined
  if (this.tier === null || this.tier === '') {
    this.tier = undefined;
  }
  
  next();
});

export default mongoose.model("User", userSchema);
