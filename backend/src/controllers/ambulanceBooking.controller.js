// controllers/ambulanceBooking.controller.js

import { AmbulanceBooking } from "../models/ambulanceBooking.model.js";
import { Ambulance } from "../models/ambulance.model.js";
import Hospital from "../models/hospital.model.js";
import { User } from "../models/user.model.js"; // ✅ Import User model (not Admin)
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyUser } from "../utils/notify.js";  

// 🟢 User books ambulance
export const bookAmbulance = asyncHandler(async (req, res) => {
  const { hospitalId, ambulanceId, pickup_location, drop_location } = req.body;

  if (!hospitalId || !ambulanceId || !pickup_location || !drop_location) {
    throw new ApiError(400, "All fields are required");
  }

  // 🚑 Check if ambulance exists and is available
  const ambulance = await Ambulance.findById(ambulanceId);
  if (!ambulance || !ambulance.is_available) {
    throw new ApiError(404, "Selected ambulance is not available");
  }

  // 🧾 Create booking
  const booking = await AmbulanceBooking.create({
    user: req.user._id,
    hospital: hospitalId,
    ambulance: ambulanceId,
    pickup_location,
    drop_location,
    status: "pending",
  });

  // 🔔 Notify all operators about this booking
  const operators = await User.find({ role: /operator/i }); //  case insensitive
  if (operators.length > 0) {
    for (const op of operators) {
      await notifyUser(
        op._id, // ✅ Fix: use _id since operators are users
        "Operator",
        "🚑 New Ambulance Request",
        `A user requested an ambulance from ${pickup_location} to ${drop_location}`
      );
    }
  } else {
    console.warn("⚠️ No operators found to notify about ambulance request.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, booking, "✅ Ambulance booking request submitted"));
});

// 🟢 Operator gets pending bookings
export const getOperatorAmbulanceBookings = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({ createdBy: req.user._id }).select("_id");

  const bookings = await AmbulanceBooking.find({
    hospital: { $in: hospitals.map((h) => h._id) },
    status: "pending",
  })
    .populate("user", "fullName email")
    .populate("hospital", "name")
    .populate("ambulance", "vehicle_number ambulance_type");

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "✅ Pending ambulance bookings"));
});

// 🟢 Operator updates booking status
export const updateAmbulanceBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  if (!["confirmed", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be confirmed or rejected");
  }

  const booking = await AmbulanceBooking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  // If confirmed, mark ambulance unavailable
  if (status === "confirmed") {
    const ambulance = await Ambulance.findById(booking.ambulance);
    if (!ambulance || !ambulance.is_available) {
      throw new ApiError(400, "Ambulance already in use");
    }

    ambulance.is_available = false;
    await ambulance.save();
  }

  booking.status = status;
  await booking.save();

  // 🔔 Notify user about update
  await notifyUser(
    booking.user,
    "User",
    "🚑 Ambulance Booking Status Updated",
    `Your ambulance request has been ${booking.status}.`
  );

  return res
    .status(200)
    .json(new ApiResponse(200, booking, `✅ Booking ${status}`));
});

// 🟢 User views own bookings
export const getUserAmbulanceBookings = asyncHandler(async (req, res) => {
  const bookings = await AmbulanceBooking.find({ user: req.user._id })
    .populate("hospital", "name address")
    .populate("ambulance", "vehicle_number ambulance_type")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "✅ Your ambulance bookings"));
});


 

// 🟢 User deletes a single ambulance booking
export const deleteAmbulanceBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await AmbulanceBooking.findOneAndDelete({
    _id: id,
    user: req.user._id, // Ensure only the user who made it can delete
  });

  if (!booking) {
    throw new ApiError(404, "Ambulance booking not found or permission denied");
  }

  // --- Important Step ---
  // If the booking was "confirmed", we must make the ambulance available again
  if (booking.status === "confirmed") {
    await Ambulance.updateOne(
      { _id: booking.ambulance },
      { $set: { is_available: true } }
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { _id: id }, "Ambulance booking deleted successfully")
    );
});

// 🟢 User deletes ALL their ambulance bookings
export const deleteAllUserAmbulanceBookings = asyncHandler(async (req, res) => {
  
  // Find all confirmed bookings for this user
  const confirmedBookings = await AmbulanceBooking.find({
    user: req.user._id,
    status: "confirmed",
  });

  // --- Important Step ---
  // Make all those ambulances available again
  if (confirmedBookings.length > 0) {
    const ambulanceIdsToUpdate = confirmedBookings.map(
      (booking) => booking.ambulance
    );
    
    await Ambulance.updateMany(
      { _id: { $in: ambulanceIdsToUpdate } },
      { $set: { is_available: true } }
    );
  }

  // Now, delete all of the user's ambulance bookings
  await AmbulanceBooking.deleteMany({
    user: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "All ambulance booking history cleared")
    );
});


// 🟢 Operator fetches COMPLETED ambulance bookings for their hospitals
export const getOperatorAmbulanceHistory = asyncHandler(async (req, res) => {
  // 1. Find all hospitals managed by this operator
  const hospitals = await Hospital.find({ createdBy: req.user._id }).select(
    "_id"
  );
  const hospitalIds = hospitals.map((h) => h._id);

  // 2. Find all bookings for these hospitals that are NOT pending
  const bookings = await AmbulanceBooking.find({
    hospital: { $in: hospitalIds },
    status: { $in: ["confirmed", "rejected", "cancelled"] }, // Get all except "pending"
  })
    .populate("user", "fullName email")
    .populate("hospital", "name")
    .populate("ambulance", "vehicle_number ambulance_type")
    .sort({ updatedAt: -1 }); // Sort by most recently updated

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        bookings,
        "Operator ambulance booking history fetched"
      )
    );
});