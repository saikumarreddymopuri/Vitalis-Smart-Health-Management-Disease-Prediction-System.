import express from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, verifyEmail, getCurrentUser,getAllUsers,
  getAllOperators,
  getUserDetails,
  updateUserDetails,
  deleteUser, } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
//import { verifyEmail } from "../controllers/emailVerify.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Register route with avatar upload
router.post("/register", upload.single("avatar"), registerUser);

// Login route
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify/:token", verifyEmail);
router.get("/me", verifyJWT, getCurrentUser);


// --- NEW ADMIN ROUTES ---
// We chain verifyJWT (to log in) and verifyAdmin (to check role)
router.route("/admin/users").get(verifyJWT, verifyAdmin, getAllUsers);
router.route("/admin/operators").get(verifyJWT, verifyAdmin, getAllOperators);

router
  .route("/admin/user/:id")
  .get(verifyJWT, verifyAdmin, getUserDetails)
  .patch(verifyJWT, verifyAdmin, updateUserDetails)
  .delete(verifyJWT, verifyAdmin, deleteUser);





export default router;
