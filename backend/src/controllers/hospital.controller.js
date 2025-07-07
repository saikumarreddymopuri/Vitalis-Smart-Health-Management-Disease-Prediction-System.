// controllers/hospital.controller.js
import Hospital from "../models/hospital.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyUser } from "../utils/notify.js";
import {User} from "../models/user.model.js";

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
  const admins = await User.find({ role: "Admin" });
for (const admin of admins) {
  await notifyUser(
    admin._id,
    "Admin",
    "🏥 Hospital Add Request",
    `An operator has requested to add a new hospital: ${newHospital.name}`
  );
}


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
  console.log("Verifying hospital with ID:", id);
  const hospital = await Hospital.findById(id);
  console.log("Found hospital:", hospital);
  if (!hospital) throw new ApiError(404, "Hospital not found");

  hospital.is_verified = true;
  await hospital.save();
  await notifyUser(
  hospital.createdBy, // this must be stored when hospital was created
  "Operator",
  "🏥 Hospital Request Reviewed",
  `Admin has ${hospital.is_verified ? "approved" : "rejected"} your hospital: ${hospital.name}`
);


  return res
    .status(200)
    .json(new ApiResponse(200, hospital, "Hospital approved successfully"));
});

// ❌ Reject
export const rejectHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Hospital.findByIdAndDelete(id);
  console.log("Rejected hospital with ID:", id);
  await notifyUser(
  hospital.createdBy, // this must be stored when hospital was created
  "Operator",
  "🏥 Hospital Request Reviewed",
  `Admin has ${hospital.is_verified ? "approved" : "rejected"} your hospital: ${hospital.name}`
);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Hospital request rejected and removed"));
});


// @desc    Get all approved hospitals added by the logged-in operator
// @route   GET /api/hospitals/operator-approved
export const getApprovedHospitalsForOperator = asyncHandler(async (req, res) => {
  const operatorId = req.user._id;

  const hospitals = await Hospital.find({
    createdBy: operatorId,
    is_verified: true, // ✅ Only approved ones
  });

  return res
    .status(200)
    .json(new ApiResponse(200, hospitals, "Approved hospitals fetched"));
});


// Helper: calculate Haversine distance (km)
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Main Controller
export const getHospitalsByDisease = asyncHandler(async (req, res) => {
  const { disease, userLat, userLng } = req.query;

  if (!disease || !userLat || !userLng) {
    throw new ApiError(400, "disease, userLat, and userLng are required");
  }

  // Step 1: Fetch hospitals where specialization_offered includes the disease
  const hospitals = await Hospital.find({
    specialization_offered: { $in: [disease.toLowerCase()] },
    is_verified: true,
  });

  // Step 2: Calculate distance to each hospital
  const hospitalsWithDistance = hospitals.map((hosp) => {
    const distance = getDistance(
      parseFloat(userLat),
      parseFloat(userLng),
      hosp.latitude,
      hosp.longitude
    );
    return { ...hosp._doc, distance: distance.toFixed(2) };
  });

  // Step 3: Sort by distance and limit to 5
  const sorted = hospitalsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return res
    .status(200)
    .json(new ApiResponse(200, sorted, "Nearby hospitals found"));
});

export const getHospitalsByOperator = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({
    createdBy: req.user._id,
    is_verified: true,
  });

  res.status(200).json(new ApiResponse(200, hospitals));
});
