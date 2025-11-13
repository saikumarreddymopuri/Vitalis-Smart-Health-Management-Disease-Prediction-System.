import express from "express";
import {
  saveSymptomPrediction,
  getPredictionsByUser,
  deletePrediction, // --- 1. Import new function
  deleteAllUserPredictions, // --- 2. Import new function
} from "../controllers/symptom.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, saveSymptomPrediction); // save prediction securely
router.get("/", verifyJWT, getPredictionsByUser); // fetch user's past predictions

// --- 3. ADD THESE TWO NEW DELETE ROUTES ---
router.delete("/user/all", verifyJWT, deleteAllUserPredictions); // Must be before /:id
router.delete("/:id", verifyJWT, deletePrediction);

export default router;