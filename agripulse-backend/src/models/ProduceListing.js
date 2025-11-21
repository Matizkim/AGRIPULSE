// src/models/ProduceListing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  crop: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  harvestDate: Date,
  expectedPrice: Number,
  location: {
    county: String,
    lat: Number,
    lng: Number
  },
  images: [String],
  status: { type: String, enum: ["available","matched","sold"], default: "available" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ProduceListing", listingSchema);
