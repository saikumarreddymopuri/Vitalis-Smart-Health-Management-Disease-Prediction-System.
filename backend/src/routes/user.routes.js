import express from "express";
import { registerUser, loginUser,logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Register route with avatar upload
router.post("/register", upload.single("avatar"), registerUser);

// Login route
router.post("/login", loginUser);
router.post("/logout", logoutUser);


export default router;
