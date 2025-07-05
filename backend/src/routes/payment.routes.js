// routes/payment.routes.js

import express from "express";
import { createRazorpayOrder } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-order", verifyJWT, createRazorpayOrder);

export default router;
