// routes/ambulance.routes.js

import express from "express";
import {
  addAmbulance,
  getHospitalAmbulances,
  getAmbulancesByHospital,
} from "../controllers/ambulance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, addAmbulance);

// ✅ Specific route first
router.get("/by-hospital/:id", verifyJWT, getAmbulancesByHospital);

// ✅ Generic route after
router.get("/:hospital_id", verifyJWT, getHospitalAmbulances);

export default router;
