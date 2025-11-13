import { Booking } from "../models/bedbooking.model.js";
import { Bed } from "../models/bed.model.js";
import  Hospital  from "../models/hospital.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notifyUser } from "../utils/notify.js";
import {User} from "../models/user.model.js";
import crypto from "crypto"; // --- IMPORT CRYPTO ---
import Razorpay from "razorpay";

// 🟢 User books bed
// export const bookBed = asyncHandler(async (req, res) => {
//   const { hospitalId, bed_type, disease, bedsCount } = req.body;

//   if (!hospitalId || !bed_type || !disease || !bedsCount) {
//     throw new ApiError(400, "hospitalId, bed_type, disease, and bedsCount are required");
//   }

//   const bedAvailable = await Bed.findOne({
//     hospital: hospitalId,
//     bed_type,
//     availableBeds: { $gte: bedsCount }
    
//   });

//   if (!bedAvailable) {
//     throw new ApiError(404, "No available beds for selected type");
//   }

//   const booking = await Booking.create({
//     user: req.user._id,
//     hospital: hospitalId,
//     bed_type,
//     disease,
//     bedsCount,
//   });
//   const operators = await User.find({ role: "Operator" }); // get all operators
// for (const op of operators) {
//   console.log("Notifying operator:", op._id);
//   console.log("name:", op.fullName);
//   await notifyUser(
//     op._id,

//     "Operator",
//     "🛏️ New Bed Booking Request",
//     `A user requested a ${bed_type} bed for ${disease}`
//   );
// }


//   res.status(201).json(new ApiResponse(201, booking, "Bed booking request created"));
// });

// --- Initialize Razorpay (Do this ONCE at the top) ---
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------------------------------------------------
// 🟢 User books bed (NOW VERIFIES PAYMENT FIRST)
// ---------------------------------------------------------------
export const bookBed = asyncHandler(async (req, res) => {
  // --- 1. Get ALL data from the request body ---
  const {
    hospitalId,
    bed_type,
    disease,
    bedsCount,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !hospitalId ||
    !bed_type ||
    !disease ||
    !bedsCount ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new ApiError(400, "All booking and payment fields are required");
  }

  // --- 2. VERIFY PAYMENT SIGNATURE ---
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isPaymentAuthentic = expectedSignature === razorpay_signature;

  if (!isPaymentAuthentic) {
    // Payment is fake or failed! DO NOT BOOK.
    throw new ApiError(400, "Invalid payment signature. Booking failed.");
  }

  // --- 3. PAYMENT IS VERIFIED! Now, check for beds ---
  const bedAvailable = await Bed.findOne({
    hospital: hospitalId,
    bed_type,
    availableBeds: { $gte: bedsCount },
  });

  if (!bedAvailable) {
    throw new ApiError(404, "No available beds for selected type");
  }

  // --- 4. Create the booking ---
  const booking = await Booking.create({ // Use BedBooking model
    user: req.user._id,
    hospital: hospitalId,
    bed_type,
    disease,
    bedsCount,
    paymentId: razorpay_payment_id, // Save payment ID
    orderId: razorpay_order_id,     // Save order ID
    paymentStatus: "success",       // Set payment status
    status: "pending",              // Set booking status to "pending" for operator
  });

  // --- 5. NOTIFY THE OPERATOR (This is the correct time) ---
  const operators = await User.find({ role: /operator/i }); // Case-insensitive
  if (operators.length > 0) {
    for (const op of operators) {
      console.log("Notifying operator:", op._id, op.fullName);
      await notifyUser(
        op._id,
        "Operator",
        "🛏️ New Bed Booking Request",
        `A user requested a ${bed_type} bed for ${disease}`
      );
    }
  } else {
    console.warn("⚠️ No operators found to notify.");
  }

  // --- 6. Send success response ---
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        booking,
        "Payment successful and booking request created"
      )
    );
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


// 🟢 User deletes a single booking
export const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findOneAndDelete({
    _id: id,
    user: req.user._id, // Ensure only the user who made the booking can delete it
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found or you do not have permission");
  }

  // --- This is an important step ---
  // If the booking was "confirmed", we must add the bed back to the hospital
  if (booking.status === "confirmed") {
    await Bed.updateOne(
      {
        hospital: booking.hospital,
        bed_type: booking.bed_type,
      },
      { $inc: { availableBeds: 1 } } // Increment availableBeds by 1
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { _id: id }, "Booking deleted successfully"));
});

// 🟢 User deletes ALL their bookings
export const deleteAllUserBookings = asyncHandler(async (req, res) => {
  
  // Find all confirmed bookings for this user first
  const confirmedBookings = await Booking.find({
    user: req.user._id,
    status: "confirmed",
  });

  // --- This is complex, but important for data integrity ---
  // We need to add all the beds back to their respective hospitals
  if (confirmedBookings.length > 0) {
    const bulkOps = [];
    // Group beds by hospital and type to update counts efficiently
    const bedUpdates = {};

    for (const booking of confirmedBookings) {
      const key = `${booking.hospital}_${booking.bed_type}`;
      if (!bedUpdates[key]) {
        bedUpdates[key] = {
          hospital: booking.hospital,
          bed_type: booking.bed_type,
          count: 0,
        };
      }
      bedUpdates[key].count += 1;
    }

    // Create the bulk update operations
    for (const key in bedUpdates) {
      const update = bedUpdates[key];
      bulkOps.push({
        updateOne: {
          filter: { hospital: update.hospital, bed_type: update.bed_type },
          update: { $inc: { availableBeds: update.count } },
        },
      });
    }
    
    if (bulkOps.length > 0) {
      await Bed.bulkWrite(bulkOps);
    }
  }

  // Now, delete all bookings for the user (confirmed, pending, rejected, etc.)
  await Booking.deleteMany({
    user: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All bed booking history cleared"));
});


// 🟢 Operator fetches COMPLETED bookings for their hospitals
export const getOperatorBedHistory = asyncHandler(async (req, res) => {
  // 1. Find all hospitals managed by this operator
  const hospitals = await Hospital.find({ createdBy: req.user._id }).select(
    "_id"
  );
  const hospitalIds = hospitals.map((h) => h._id);

  // 2. Find all bookings for these hospitals that are NOT pending
  const bookings = await Booking.find({
    hospital: { $in: hospitalIds },
    status: { $in: ["confirmed", "rejected", "cancelled"] }, // Get all except "pending"
  })
    .populate("user", "fullName email")
    .populate("hospital", "name")
    .sort({ updatedAt: -1 }); // Sort by most recently updated

  res
    .status(200)
    .json(
      new ApiResponse(200, bookings, "Operator booking history fetched")
    );
});