import { Booking } from "../models/bedbooking.model.js";
import { Bed } from "../models/bed.model.js";
import  Hospital  from "../models/hospital.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyUser } from "../utils/notify.js";
import {User} from "../models/user.model.js";

// 🟢 User books bed
export const bookBed = asyncHandler(async (req, res) => {
  const { hospitalId, bed_type, disease, bedsCount } = req.body;

  if (!hospitalId || !bed_type || !disease || !bedsCount) {
    throw new ApiError(400, "hospitalId, bed_type, disease, and bedsCount are required");
  }

  const bedAvailable = await Bed.findOne({
    hospital: hospitalId,
    bed_type,
    availableBeds: { $gte: bedsCount }
    
  });

  if (!bedAvailable) {
    throw new ApiError(404, "No available beds for selected type");
  }

  const booking = await Booking.create({
    user: req.user._id,
    hospital: hospitalId,
    bed_type,
    disease,
    bedsCount,
  });
  const operators = await User.find({ role: "Operator" }); // get all operators
for (const op of operators) {
  console.log("Notifying operator:", op._id);
  console.log("name:", op.fullName);
  await notifyUser(
    op._id,

    "Operator",
    "🛏️ New Bed Booking Request",
    `A user requested a ${bed_type} bed for ${disease}`
  );
}


  res.status(201).json(new ApiResponse(201, booking, "Bed booking request created"));
});

// 🟢 Operator fetches bookings for their hospitals
export const getOperatorBookings = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({ createdBy: req.user._id }).select("_id");

  const bookings = await Booking.find({
    hospital: { $in: hospitals.map(h => h._id) },
    status: "pending"
  }).populate("user", "fullName email").populate("hospital", "name");

  res.status(200).json(new ApiResponse(200, bookings, "Pending bookings for your hospitals"));
});

// 🟢 Operator approves or rejects
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  if (!["confirmed", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be confirmed or rejected");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  // If confirmed, decrement availableBeds
  if (status === "confirmed") {
    const bed = await Bed.findOne({
      hospital: booking.hospital,
      bed_type: booking.bed_type,
      availableBeds: { $gt: 0 }
    });

    if (!bed) throw new ApiError(400, "No beds available to confirm");

    bed.availableBeds -= 1;
    await bed.save();
  }

  booking.status = status;
  await booking.save();
  await notifyUser(
  booking.user,   // user who made the booking
  "User",
  "🛏️ Bed Booking Status Updated",
  `Your booking has been ${booking.status}`
);


  res.status(200).json(new ApiResponse(200, booking, `Booking ${status}`));
});

// 🟢 User fetches own bookings
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("hospital", "name address city")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, bookings, "Your bookings"));
});

// 🟢 Cancel booking (only if still pending)
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: "pending"
  });

  if (!booking) throw new ApiError(404, "Booking not found or can't cancel");

  booking.status = "cancelled";
  await booking.save();

  res.status(200).json(new ApiResponse(200, booking, "Booking cancelled"));
});
