import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // --- BUG FIX: Changed 'User' to 'user' ---
      throw new ApiError(401, "Invalid access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// --- NEW FUNCTION ---
// This middleware checks if the user is an Admin
// It must be used AFTER verifyJWT
export const verifyAdmin = asyncHandler(async (req, _, next) => {
  if (req.user?.role !== "Admin") {
    throw new ApiError(403, "Forbidden! You are not an Admin.");
  }
  next();
});