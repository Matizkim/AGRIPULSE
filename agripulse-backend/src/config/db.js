// src/config/db.js
import mongoose from "mongoose";

/**
 * URL-encode a password for use in MongoDB connection string
 * Special characters like @, #, $, %, &, +, =, /, ?, : need to be encoded
 */
function encodePassword(password) {
  return encodeURIComponent(password);
}

/**
 * Parse and fix MongoDB URI if password contains special characters
 */
function fixMongoURI(uri) {
  try {
    // Check if URI already has encoded password (contains %)
    if (uri.includes('%')) {
      // Already encoded, return as is
      return uri;
    }

    // Parse the URI to extract components
    const match = uri.match(/^(mongodb\+srv?:\/\/)([^:]+):([^@]+)@(.+)$/);
    
    if (!match) {
      // If parsing fails, return original (might be malformed)
      return uri;
    }

    const [, protocol, username, password, rest] = match;
    
    // Check if password needs encoding (contains special characters)
    const needsEncoding = /[@#$%&+\/=?:]/.test(password);
    
    if (needsEncoding) {
      const encodedPassword = encodePassword(password);
      const fixedURI = `${protocol}${username}:${encodedPassword}@${rest}`;
      console.log("⚠️  Password contains special characters - auto-encoding...");
      return fixedURI;
    }

    return uri;
  } catch (err) {
    // If parsing fails, return original URI
    console.warn("⚠️  Could not parse URI for password encoding, using as-is");
    return uri;
  }
}

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

  // Fix URI if password contains special characters
  const fixedURI = fixMongoURI(uri);

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(fixedURI, {
      // Mongoose 7 no options required for the most part
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n💡 Troubleshooting:");
    console.error("1. Check if MONGODB_URI is set correctly in Render environment variables");
    console.error("2. If password contains special characters (@, #, $, %, &, +, =, /, ?, :), they must be URL-encoded");
    console.error("3. Verify MongoDB Atlas cluster is running");
    console.error("4. Check if IP address is whitelisted in MongoDB Atlas (0.0.0.0/0)");
    console.error("5. Verify database user credentials are correct");
    console.error("6. Try creating a new database user with a simpler password (no special chars)");
    console.error("\n📝 Special characters that need encoding:");
    console.error("   @ → %40, # → %23, $ → %24, % → %25, & → %26");
    console.error("   + → %2B, = → %3D, / → %2F, ? → %3F, : → %3A");
    process.exit(1);
  }
}
