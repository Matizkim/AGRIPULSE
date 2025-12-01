// src/routes/messages.js
import express from "express";
import Message from "../models/Message.js";
import Match from "../models/Match.js";
import { requireAuth } from "../utils/clerkVerify.js";
import { createOrGetLocalUser } from "../utils/userMapping.js";
import { validateRequired, validateParamObjectId } from "../utils/validation.js";

const router = express.Router();

// Get messages for a match
router.get(
  "/match/:matchId",
  requireAuth(),
  createOrGetLocalUser,
  validateParamObjectId("matchId"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const userId = req.localUser._id;

      // Verify user has access to this match
      const match = await Match.findById(matchId)
        .populate("listingId")
        .populate("demandId");

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const isAuthorized = 
        match.initiatedBy.toString() === userId.toString() ||
        match.acceptedBy?.toString() === userId.toString() ||
        match.listingId?.farmerId?.toString() === userId.toString() ||
        match.demandId?.buyerId?.toString() === userId.toString();

      if (!isAuthorized) {
        return res.status(403).json({ error: "Not authorized to view messages for this match" });
      }

      const messages = await Message.find({ matchId })
        .populate("from", "name")
        .populate("to", "name")
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ error: "Could not fetch messages" });
    }
  }
);

// Send message
router.post(
  "/",
  requireAuth(),
  createOrGetLocalUser,
  validateRequired(["matchId", "content"]),
  async (req, res) => {
    try {
      const { matchId, content, type = "text", attachments } = req.body;
      const userId = req.localUser._id;

      // Verify match exists and user has access
      const match = await Match.findById(matchId)
        .populate("listingId")
        .populate("demandId");

      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Determine recipient
      let recipientId;
      if (match.initiatedBy.toString() === userId.toString()) {
        // If initiator, recipient is the other party
        recipientId = match.acceptedBy || 
          (match.listingId.farmerId.toString() === userId.toString() 
            ? match.demandId.buyerId 
            : match.listingId.farmerId);
      } else {
        recipientId = match.initiatedBy;
      }

      if (!recipientId) {
        return res.status(400).json({ error: "Cannot determine message recipient" });
      }

      // Create message
      const message = await Message.create({
        matchId,
        from: userId,
        to: recipientId,
        content,
        type,
        attachments: attachments || []
      });

      // Add event to match
      match.events.push({
        who: userId,
        what: "message",
        message: content,
        timestamp: new Date()
      });
      await match.save();

      // Emit Socket.IO event
      const io = req.app.get("io");
      if (io) {
        io.to(`match:${matchId}`).emit("newMessage", message);
        io.to(`user:${recipientId}`).emit("newMessage", message);
      }

      const populated = await Message.findById(message._id)
        .populate("from", "name")
        .populate("to", "name");

      res.status(201).json(populated);
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({ error: "Could not send message" });
    }
  }
);

// Mark messages as read
router.put(
  "/read/:matchId",
  requireAuth(),
  createOrGetLocalUser,
  validateParamObjectId("matchId"),
  async (req, res) => {
    try {
      const { matchId } = req.params;
      const userId = req.localUser._id;

      await Message.updateMany(
        { matchId, to: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.json({ message: "Messages marked as read" });
    } catch (err) {
      console.error("Error marking messages as read:", err);
      res.status(500).json({ error: "Could not mark messages as read" });
    }
  }
);

export default router;

