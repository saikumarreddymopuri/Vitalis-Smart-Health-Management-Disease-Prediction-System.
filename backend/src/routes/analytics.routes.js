import { Router } from "express";
import { getMainStats, getLiveFeed } from "../controllers/analytics.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes in this file are for logged-in Admins only
router.use(verifyJWT, verifyAdmin);

// Route for the main stats and charts
// e.g., GET /api/v1/analytics/main
router.get("/main", getMainStats);

// Route for the live activity feed
// e.g., GET /api/v1/analytics/feed
router.get("/feed", getLiveFeed);

export default router;