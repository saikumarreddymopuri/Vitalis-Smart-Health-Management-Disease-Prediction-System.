import express from "express";
import {
  bookBed,
  getOperatorBookings,
  updateBookingStatus,
  getUserBookings,
  cancelBooking,
} from "../controllers/bedbooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, bookBed);
router.get("/user", verifyJWT, getUserBookings);
router.get("/operator", verifyJWT, getOperatorBookings);
router.patch("/:id/status", verifyJWT, updateBookingStatus);
router.patch("/:id/cancel", verifyJWT, cancelBooking);

export default router;
