 
import express from "express";
import { addBed } from "../controllers/bed.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, addBed); // Protected route for operator

export default router;
