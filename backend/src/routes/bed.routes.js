 
import express from "express";
import { addBed, getHospitalBeds } from "../controllers/bed.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, addBed); // Protected route for operator
router.get("/:hospital_id", verifyJWT, getHospitalBeds);


export default router;
