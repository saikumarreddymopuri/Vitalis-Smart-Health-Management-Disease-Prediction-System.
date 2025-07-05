 
import { Bed } from "../models/bed.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

 
export const addBed = asyncHandler(async (req, res) => {
  const { hospital_id, bed_type, is_available, price_per_day, quantity, availableBeds } = req.body;

  if (!hospital_id || !bed_type || !price_per_day || !quantity ) {
    throw new ApiError(400, "All fields are required.");
  }

  const newBed = await Bed.create({
    hospital: hospital_id,
    bed_type,
    quantity, // Set quantity to the number of beds
    availableBeds: quantity, // Set availableBeds to quantity
    is_available: is_available ?? true, // fallback to true
    price_per_day,
    
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newBed, "✅ Bed added successfully"));
});

export const getHospitalBeds = asyncHandler(async (req, res) => {
  const { hospital_id } = req.params;

  const beds = await Bed.find({
  hospital: hospital_id,
  is_available: true,
});


  return res
    .status(200)
    .json(new ApiResponse(200, beds, "✅ Beds fetched"));
});
