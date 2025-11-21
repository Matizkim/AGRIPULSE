// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  role: { type: String, enum: ["farmer","buyer","driver","admin"], default: "farmer" },
  location: {
    county: String,
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
