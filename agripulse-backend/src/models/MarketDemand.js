// src/models/MarketDemand.js
/*import mongoose from "mongoose";

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
*/

// src/models/MarketDemand.js
import mongoose from "mongoose";

const demandSchema = new mongoose.Schema({
  // Store Clerk buyer id as string (matching how you create demands with req.user.userId)
  buyerId: { type: String, required: true },

  crop: { type: String, required: true },
  qtyKg: { type: Number, required: true },
  priceOffer: Number,
  pickupWindow: { start: Date, end: Date },
  location: { county: String, lat: Number, lng: Number },
  status: { type: String, enum: ["open","fulfilled","expired"], default: "open" },
  postedAt: { type: Date, default: Date.now },
  expiresAt: Date
});

// Useful index for querying open demands by crop/county
demandSchema.index({ "location.county": 1, crop: 1, status: 1 });

export default mongoose.model("MarketDemand", demandSchema);
