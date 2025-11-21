// src/models/SmsLog.js
import mongoose from "mongoose";

const smsLog = new mongoose.Schema({
  //to: String,
  to: String,
  from: String,
  body: String,
  providerResponse: mongoose.Schema.Types.Mixed,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("SmsLog", smsLog);
