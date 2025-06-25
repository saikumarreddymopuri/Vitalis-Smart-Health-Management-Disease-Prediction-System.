// controllers/symptom.controller.js
import Symptom from "../models/symptom.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc Save a prediction securely using user from token
export const saveSymptomPrediction = asyncHandler(async (req, res) => {
  const { symptom_list, predicted_disease } = req.body;

  if (!symptom_list || !predicted_disease) {
    throw new ApiError(400, "symptom_list and predicted_disease are required");
  }

  const entry = await Symptom.create({
    user: req.user._id, // ✅ from verified token
    symptomList: symptom_list,
    predictedDisease: predicted_disease,
    predictionDate: new Date(),
  });

  return res.status(201).json(
    new ApiResponse(201, entry, "✅ Prediction saved successfully")
  );
});

// @desc Get all predictions for the logged-in user
export const getPredictionsByUser = asyncHandler(async (req, res) => {
  const predictions = await Symptom.find({ user: req.user._id }).sort({
    predictionDate: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, predictions, "✅ Past predictions loaded"));
});
