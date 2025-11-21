// src/models/TransportPool.js
import mongoose from "mongoose";

const transportSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  capacityKg: Number,
  availableFrom: Date,
  route: String,
  pricePerKm: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("TransportPool", transportSchema);
