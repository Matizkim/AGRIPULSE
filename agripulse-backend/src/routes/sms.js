import express from "express";
import at from "../utils/africasTalking.js";
import SmsLog from "../models/SmsLog.js";

const router = express.Router();

// Send SMS via Africa's Talking
router.post("/send", async (req, res) => {
  try {
    // Destructure first
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "to and message required" });
    }

    const from =
      process.env.NODE_ENV === "production"
        ? process.env.AT_SENDER_NAME
        : "sandbox";

    // Logging after destructuring
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Sender being used:", from);
    console.log("SMS options:", { to, message, from });

    const smsOptions = { to, message, from };
    const result = await at.SMS.send(smsOptions);

    // Log only safe properties to avoid circular structure
    const logData = {
      to,
      body: message,
      providerResponse: JSON.stringify(result),
      status: "sent",
    };

    await SmsLog.create(logData);

    res.json({ success: true, result });
  } catch (err) {
    console.error("SMS send error:", err.response?.data || err.message);

    // Safe logging
    const logError = {
      to: req.body.to,
      body: req.body.message,
      providerResponse: err.response?.data || err.message,
      status: "error",
    };
    await SmsLog.create(logError);

    res.status(500).json({ error: "Failed to send SMS" });
  }
});

// Callback route for delivery reports or inbound messages
router.post("/callback", express.raw({ type: "*/*" }), async (req, res) => {
  console.log("AT callback headers:", req.headers);
  console.log(
    "AT callback body:",
    req.body.toString ? req.body.toString() : req.body
  );
  res.status(200).send("ok");
});

export default router;
