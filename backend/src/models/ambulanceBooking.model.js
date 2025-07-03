// models/ambulanceBooking.model.js

import mongoose from "mongoose";

const ambulanceBookingSchema = new mongoose.Schema(
  {
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
    ambulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
      required: true,
    },
    pickup_location: {
      type: String,
      required: true,
    },
    drop_location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "rejected"],
      default: "pending",
    },
    booking_time: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const AmbulanceBooking = mongoose.model("AmbulanceBooking", ambulanceBookingSchema);
