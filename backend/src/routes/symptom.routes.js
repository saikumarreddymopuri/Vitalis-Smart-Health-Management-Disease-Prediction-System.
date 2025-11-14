import express from "express";
import {
  saveSymptomPrediction,
  getPredictionsByUser,
  deletePrediction,
  deleteAllUserPredictions,
  getPrediction, // --- 1. IMPORT THE NEW FUNCTION ---
} from "../controllers/symptom.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// --- 2. ADD THE NEW PREDICT ROUTE ---
// This MUST be before the '/:id' route
router.post("/predict", verifyJWT, getPrediction);

// --- Your existing routes ---
router.post("/", verifyJWT, saveSymptomPrediction);
router.get("/", verifyJWT, getPredictionsByUser);
router.delete("/user/all", verifyJWT, deleteAllUserPredictions);
router.delete("/:id", verifyJWT, deletePrediction);

export default router;