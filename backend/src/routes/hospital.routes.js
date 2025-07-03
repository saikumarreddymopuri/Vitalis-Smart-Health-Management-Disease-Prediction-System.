// routes/hospital.routes.js
import express from "express";
import { createHospital , getPendingHospitals, verifyHospital, rejectHospital, getApprovedHospitalsForOperator, getHospitalsByDisease, getHospitalsByOperator} from "../controllers/hospital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Operator creates hospital request
router.post("/", verifyJWT, createHospital);
// Get all pending hospitals
router.get("/pending", verifyJWT, getPendingHospitals);

// Admin verifies a hospital
router.put("/:id/verify", verifyJWT, verifyHospital);
router.delete("/:id", verifyJWT, rejectHospital);

// Get hospitals added by operator AND approved by admin
router.get("/operator-approved", verifyJWT, getApprovedHospitalsForOperator);

router.get("/nearby-by-disease", verifyJWT, getHospitalsByDisease);

router.get("/operator", verifyJWT, getHospitalsByOperator);







export default router;
