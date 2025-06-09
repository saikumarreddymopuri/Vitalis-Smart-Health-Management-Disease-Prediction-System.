import express from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyEmail } from "../controllers/emailVerify.controller.js";
const router = express.Router();

// Register route with avatar upload
router.post("/register", upload.single("avatar"), registerUser);

// Login route
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify-email", verifyEmail);




export default router;
