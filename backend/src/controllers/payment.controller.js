// controllers/payment.controller.js

import Razorpay from "razorpay";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🟢 Create Razorpay order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, receipt } = req.body;

  if (!amount) throw new ApiError(400, "Amount is required");

  const options = {
    amount: amount * 100, // in paisa
    currency: "INR",
    receipt: receipt || `receipt_order_${Date.now()}`,
  };

  const order = await razorpayInstance.orders.create(options);
  return res.status(201).json(new ApiResponse(201, order, "✅ Razorpay order created"));
});
