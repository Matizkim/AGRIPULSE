// src/models/MarketDemand.js
import mongoose from "mongoose";

const demandSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  crop: { type: String, required: true },
  qtyKg: { type: Number, required: true },
  priceOffer: Number,
  pickupWindow: { start: Date, end: Date },
  location: { county: String, lat: Number, lng: Number },
  status: { type: String, enum: ["open","fulfilled","expired"], default: "open" },
  postedAt: { type: Date, default: Date.now },
  expiresAt: Date
});

export default mongoose.model("MarketDemand", demandSchema);
