import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptomList: {
      type: [String],
      required: true,
    },
    predictedDisease: {
      type: String,
      required: true,
    },
    predictionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Symptom", symptomSchema);
