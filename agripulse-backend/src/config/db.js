// src/config/db.js
import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      // Mongoose 7 no options required for the most part
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
