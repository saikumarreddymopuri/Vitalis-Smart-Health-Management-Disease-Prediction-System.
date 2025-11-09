import express from "express";
import {
  getNotifications,
  markAsSeen,
  deleteNotification, // --- 1. Import the new function
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", verifyJWT, getNotifications);
router.put("/:id/seen", verifyJWT, markAsSeen);

// --- 2. Add the new DELETE route ---
router.delete("/:id", verifyJWT, deleteNotification);

export default router;