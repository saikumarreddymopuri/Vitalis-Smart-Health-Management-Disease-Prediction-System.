// routes/symptom.routes.js
import express from "express";
import {
  saveSymptomPrediction,
  getPredictionsByUser,
} from "../controllers/symptom.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, saveSymptomPrediction); // save prediction securely
router.get("/", verifyJWT, getPredictionsByUser); // fetch user's past predictions

export default router;
