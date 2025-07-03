// routes/ambulanceBooking.routes.js

import express from "express";
import {
  bookAmbulance,
  getOperatorAmbulanceBookings,
  updateAmbulanceBookingStatus,
  getUserAmbulanceBookings,
} from "../controllers/ambulanceBooking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, bookAmbulance);
router.get("/user", verifyJWT, getUserAmbulanceBookings);
router.get("/operator", verifyJWT, getOperatorAmbulanceBookings);
router.patch("/:id/status", verifyJWT, updateAmbulanceBookingStatus);

export default router;
