// models/bed.model.js
import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
  {
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
    quantity: {
        type: Number,
        required: true
    },
    availableBeds: {
        type: Number,
        //required: true,
        default: 0
    },


    is_available: {
      type: Boolean,
      default: true,
    },
    price_per_day: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Bed = mongoose.model("Bed", bedSchema);
