// controllers/hospital.controller.js
import Hospital from "../models/hospital.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Operator creates a hospital request
// @route   POST /api/hospitals
// @access  Operator only
export const createHospital = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    city,
    contact_number,
    specialization_offered,
    latitude,
    longitude,
  } = req.body;

  if (!name || !address || !city || !contact_number || !specialization_offered) {
    throw new ApiError(400, "All required fields must be filled");
  }

  const newHospital = await Hospital.create({
    name,
    address,
    city,
    contact_number,
    specialization_offered,
    latitude,
    longitude,
    createdBy: req.user._id,
    is_verified: false,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newHospital, "Hospital request submitted"));
});

// Get all hospitals
export const getPendingHospitals = asyncHandler(async (req, res) => {
  const pending = await Hospital.find({ is_verified: false });

  return res
    .status(200)
    .json(new ApiResponse(200, pending, "Pending hospital requests"));
});


// ✅ Approve
export const verifyHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hospital = await Hospital.findById(id);
  if (!hospital) throw new ApiError(404, "Hospital not found");

  hospital.is_verified = true;
  await hospital.save();

  return res
    .status(200)
    .json(new ApiResponse(200, hospital, "Hospital approved successfully"));
});

// ❌ Reject
export const rejectHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Hospital.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Hospital request rejected and removed"));
});
