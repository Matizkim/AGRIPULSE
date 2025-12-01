// src/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Match this message belongs to
  matchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Match", 
    required: true,
    index: true
  },
  
  // Sender and receiver
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true
  },
  
  // Message content
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["text", "image", "file", "system"],
    default: "text"
  },
  
  // Media attachments
  attachments: [{
    url: String,
    type: String, // "image", "document"
    filename: String,
    size: Number
  }],
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // SMS fallback
  smsSent: { type: Boolean, default: false },
  smsSentAt: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true }
});

// Indexes for efficient queries
messageSchema.index({ matchId: 1, createdAt: -1 });
messageSchema.index({ from: 1, createdAt: -1 });
messageSchema.index({ to: 1, isRead: 1 });

export default mongoose.model("Message", messageSchema);

