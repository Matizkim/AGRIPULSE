// src/config/db.js
import mongoose from "mongoose";

export async function connectDB(uri) {
  // Validate URI exists
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in environment variables!");
    console.error("Please set MONGODB_URI in your Render environment variables.");
    console.error("Format: mongodb+srv://username:password@cluster.mongodb.net/database");
    process.exit(1);
  }

  // Validate URI format
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error("❌ Invalid MONGODB_URI format!");
    console.error("URI must start with 'mongodb://' or 'mongodb+srv://'");
    console.error("Current value:", uri.substring(0, 20) + "...");
    process.exit(1);
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(uri, {
      // Mongoose 7 no options required for the most part
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n💡 Troubleshooting:");
    console.error("1. Check if MONGODB_URI is set correctly in Render environment variables");
    console.error("2. Verify MongoDB Atlas cluster is running");
    console.error("3. Check if IP address is whitelisted in MongoDB Atlas (0.0.0.0/0)");
    console.error("4. Verify database user credentials are correct");
    console.error("5. Ensure connection string format is: mongodb+srv://user:pass@cluster.mongodb.net/dbname");
    process.exit(1);
  }
}
