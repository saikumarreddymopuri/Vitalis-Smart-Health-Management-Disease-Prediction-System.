// models/ambulance.model.js

import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    ambulance_type: {
      type: String,
      enum: ["basic", "icu", "ac", "non-ac"],
      required: true,
    },
    vehicle_number: {
      type: String,
      required: true,
      unique: true,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    price_per_km: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Ambulance = mongoose.model("Ambulance", ambulanceSchema);
