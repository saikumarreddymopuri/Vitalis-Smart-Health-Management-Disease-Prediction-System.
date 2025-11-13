import express from "express";
import {
  bookBed,
  getOperatorBookings,
  updateBookingStatus,
  getUserBookings,
  cancelBooking,
  deleteBooking, // --- 1. Import new function
  deleteAllUserBookings, // --- 2. Import new function
  getOperatorBedHistory,
} from "../controllers/bedbooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, bookBed);
router.get("/user", verifyJWT, getUserBookings);
router.get("/operator", verifyJWT, getOperatorBookings);
router.get("/operator/history", verifyJWT, getOperatorBedHistory);
router.patch("/:id/status", verifyJWT, updateBookingStatus);
router.patch("/:id/cancel", verifyJWT, cancelBooking);

// --- 3. ADD THESE TWO NEW DELETE ROUTES ---
router.delete("/user/all", verifyJWT, deleteAllUserBookings); // Must be before /:id
router.delete("/:id", verifyJWT, deleteBooking);

export default router;