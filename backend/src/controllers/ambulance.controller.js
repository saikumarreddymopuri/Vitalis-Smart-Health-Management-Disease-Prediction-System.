// controllers/ambulance.controller.js

import { Ambulance } from "../models/ambulance.model.js";
import  Hospital  from "../models/hospital.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🟢 Operator adds an ambulance
export const addAmbulance = asyncHandler(async (req, res) => {
  const { hospital_id, ambulance_type, vehicle_number, price_per_km } = req.body;

  if (!hospital_id || !ambulance_type || !vehicle_number || !price_per_km) {
    throw new ApiError(400, "All fields are required");
  }

  const hospital = await Hospital.findOne({
    _id: hospital_id,
    createdBy: req.user._id,
    is_verified: true,
  });

  if (!hospital) {
    throw new ApiError(403, "❌ Hospital not found or not verified or not owned by this operator");
  }

  const ambulance = await Ambulance.create({
    hospital: hospital_id,
    ambulance_type,
    vehicle_number,
    price_per_km,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, ambulance, "✅ Ambulance added successfully"));
});

// 🟢 Get all ambulances for a hospital (used in frontend dropdown)
export const getHospitalAmbulances = asyncHandler(async (req, res) => {
  const { hospital_id } = req.params;

  const ambulances = await Ambulance.find({
    hospital: hospital_id,
    is_available: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, ambulances, "✅ Available ambulances fetched"));
});

export const getAmbulancesByHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ambulances = await Ambulance.find({ hospital_id: id });

  res.status(200).json(new ApiResponse(200, ambulances, "Ambulances for hospital"));
});
