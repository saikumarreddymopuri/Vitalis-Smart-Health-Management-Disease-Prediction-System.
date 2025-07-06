import express from "express";
import { getNotifications, markAsSeen } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", verifyJWT, getNotifications);
router.put("/:id/seen", verifyJWT, markAsSeen);

export default router;
