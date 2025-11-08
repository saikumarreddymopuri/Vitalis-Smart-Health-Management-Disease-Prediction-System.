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
  const operators = await User.find({ role: "operator" }); // ✅ Fix: use User
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
