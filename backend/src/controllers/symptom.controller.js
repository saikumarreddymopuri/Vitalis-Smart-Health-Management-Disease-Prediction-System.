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

// @desc Delete a specific prediction by ID for the logged-in user
export const deletePrediction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prediction = await Symptom.findOneAndDelete({
    _id: id,
    user: req.user._id, // Ensure only the user who made it can delete
  });

  if (!prediction) {
    throw new ApiError(404, "Prediction not found or permission denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { _id: id }, "Prediction deleted successfully"));
});

// @desc Delete all predictions for the logged-in user
export const deleteAllUserPredictions = asyncHandler(async (req, res) => {
  await Symptom.deleteMany({
    user: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All prediction history cleared"));
});

// --- THIS IS THE NEW FUNCTION ---
// @desc    Get prediction from ML API
// @route   POST /api/symptoms/predict
// @access  User only
export const getPrediction = asyncHandler(async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    throw new ApiError(400, "Symptoms array is required");
  }

  // We call your new LIVE ML API from the backend
  // We will get this URL from your .env variables
  const mlApiUrl = process.env.ML_API_URL;

  if (!mlApiUrl) {
    throw new ApiError(500, "ML API URL is not configured on the server");
  }

  try {
    // We are calling your new Render URL: https://vitalis-ml-api.onrender.com/predict
    const response = await fetch(`${mlApiUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: symptoms }),
    });

    if (!response.ok) {
      throw new ApiError(500, "Failed to get prediction from ML service");
    }

    const data = await response.json();

    // Send the AI's prediction back to the frontend
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Prediction successful"));
  } catch (error) {
    console.error("ML API call error:", error);
    throw new ApiError(500, "Error communicating with prediction service");
  }
});