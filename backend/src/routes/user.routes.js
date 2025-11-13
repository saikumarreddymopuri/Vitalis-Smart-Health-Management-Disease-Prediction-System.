import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  getCurrentUser,
  getAllUsers,
  getAllOperators,
  getUserDetails,
  updateUserDetails,
  deleteUser,
  updateCurrentUser, // --- 1. IMPORT THE NEW FUNCTION ---
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
const router = express.Router();

// --- PUBLIC USER ROUTES ---
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyEmail);

// --- SECURE USER ROUTES (Logged in) ---
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", verifyJWT, getCurrentUser);

// --- 2. ADD THE NEW ROUTE FOR UPDATING THE CURRENT USER ---
router.patch("/update-me", verifyJWT, updateCurrentUser);

// --- SECURE ADMIN ROUTES ---
router.route("/admin/users").get(verifyJWT, verifyAdmin, getAllUsers);
router.route("/admin/operators").get(verifyJWT, verifyAdmin, getAllOperators);

router
  .route("/admin/user/:id")
  .get(verifyJWT, verifyAdmin, getUserDetails)
  .patch(verifyJWT, verifyAdmin, updateUserDetails)
  .delete(verifyJWT, verifyAdmin, deleteUser);

export default router;