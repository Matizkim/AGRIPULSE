// src/models/ProduceListing.js
/*import mongoose from "mongoose";

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
*/

// src/models/ProduceListing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  // Store Clerk user id as a string (e.g. "user_35q0t...")
  farmerId: { type: String, required: true },

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

// Optional: add an index if you query by farmerId frequently
listingSchema.index({ farmerId: 1 });

export default mongoose.model("ProduceListing", listingSchema);
