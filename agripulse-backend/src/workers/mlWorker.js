// src/workers/mlWorker.js
// A simple periodic worker stub to compute and store predictions.
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import MarketDemand from "../models/MarketDemand.js";
import fs from "fs";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("ML Worker connected to DB");
  // Example flow: aggregate recent demand, compute naive forecasts, write to analytics collection
  // For now produce a sample JSON file with naive trend predictions
  const demands = await MarketDemand.find({}).limit(100);
  // TODO: real feature engineering here
  const report = {
    generatedAt: new Date(),
    sampleCount: demands.length,
    note: "Replace with real model"
  };
  fs.writeFileSync("./ml_prediction_sample.json", JSON.stringify(report, null, 2));
  console.log("ML sample saved");
  process.exit(0);
}

run().catch(console.error);
