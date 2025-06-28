// routes/hospital.routes.js
import express from "express";
import { createHospital , getPendingHospitals, verifyHospital, rejectHospital} from "../controllers/hospital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Operator creates hospital request
router.post("/", verifyJWT, createHospital);
// Get all pending hospitals
router.get("/pending", verifyJWT, getPendingHospitals);

// Admin verifies a hospital
router.put("/:id/verify", verifyJWT, verifyHospital);
router.delete("/:id", verifyJWT, rejectHospital);



export default router;
