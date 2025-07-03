import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  bed_type: {
    type: String,
    enum: ["general", "icu", "ventilator", "deluxe"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "rejected"],
    default: "pending",
  },
  disease: {
    type: String,
    required: true,
  },
  bedsCount: {
    type: Number,
    required: true,
    min: 1, // Ensure at least one bed is booked
  },
  booking_date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export const Booking = mongoose.model("BedBooking", bookingSchema);
