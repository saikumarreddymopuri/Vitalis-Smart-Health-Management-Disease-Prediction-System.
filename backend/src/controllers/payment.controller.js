// controllers/payment.controller.js

import Razorpay from "razorpay";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------------------------------------------------
// 🟢 Create Razorpay order
// ---------------------------------------------------------------
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // Only need amount

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Valid amount is required");
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // in paisa, ensure it's an integer
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      throw new ApiError(500, "Razorpay order creation failed");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, order, "✅ Razorpay order created"));
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    throw new ApiError(500, error.message || "Error creating Razorpay order");
  }
});