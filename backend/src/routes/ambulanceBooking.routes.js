import express from "express";
import {
  bookAmbulance,
  getOperatorAmbulanceBookings,
  updateAmbulanceBookingStatus,
  getUserAmbulanceBookings,
  deleteAmbulanceBooking, // --- 1. Import new function
  deleteAllUserAmbulanceBookings, // --- 2. Import new function
  getOperatorAmbulanceHistory,
} from "../controllers/ambulanceBooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, bookAmbulance);
router.get("/user", verifyJWT, getUserAmbulanceBookings);
router.get("/operator", verifyJWT, getOperatorAmbulanceBookings);
router.get("/operator/history", verifyJWT, getOperatorAmbulanceHistory);
router.patch("/:id/status", verifyJWT, updateAmbulanceBookingStatus);

// --- 3. ADD THESE TWO NEW DELETE ROUTES ---
router.delete("/user/all", verifyJWT, deleteAllUserAmbulanceBookings); // Must be before /:id
router.delete("/:id", verifyJWT, deleteAmbulanceBooking);

export default router;