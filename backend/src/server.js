// src/server.js

export const config = {
  api: {
    bodyParser: false,
  },
};



import dotenv from "dotenv";
dotenv.config();

// Ensure DB connects when Vercel cold-starts the function
import connectDB from "./db/index.js";
import { app } from "./app.js";

let dbConnected = false;

// Connect once per cold start (Vercel may reuse the same instance)
const ensureDb = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log("✅ MongoDB connected (cold-start)");
    } catch (err) {
      console.error("❌ MongoDB connection error (cold-start):", err);
      // don't throw here - let incoming request surface error if DB not ready
    }
  }
};

// Default export is the Express app handler for @vercel/node
// We wrap to ensure DB connection attempt on first request
export default async function handler(req, res) {
  // ensure DB connected (non-blocking if already connected)
  await ensureDb();

  // Pass through to Express app
  return app(req, res);
}
