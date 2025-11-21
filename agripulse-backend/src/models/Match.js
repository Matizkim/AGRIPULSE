// src/models/Match.js
import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "ProduceListing", required: true },
  demandId: { type: mongoose.Schema.Types.ObjectId, ref: "MarketDemand", required: true },
  priceAgreed: Number,
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["requested","accepted","in_transit","completed","cancelled"], default: "requested" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Match", matchSchema);
