import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail,sendVerificationEmail } from "../utils/email.js";

// REGISTER USER (Manual)
  export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, phone } = req.body;
  const avatarLocalPath = req.file?.path;

  if (!fullName || !username || !email || !password || !avatarLocalPath || !phone) {
    throw new ApiError(400, "All fields are required including avatar.");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(409, "User already exists with given email or username.");
  }

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    phone,
    avatar: avatarUpload.url,
  });

  // Generate email verification token
  const emailToken = user.generateEmailToken();

  // 🥳 Send Welcome Email
  await sendWelcomeEmail(user.email, user.fullName);

  // Send verification email
  await sendVerificationEmail(user.email, emailToken);

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
        },
        "User Registered Successfully. Please check your email to verify your account."
      )
    );
});


// LOGIN USER (Manual)
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userData = await User.findById(user._id).select("-password -refreshToken");

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json(
      new ApiResponse(200, { user: userData, accessToken }, "Login successful")
    );
});


// LOGOUT USER

export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.header("x-refresh-token");

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Remove refresh token from DB
    user.refreshToken = null;
    await user.save();

    // Clear cookie on client
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};

// refresh access token
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.header("x-refresh-token");

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    // Verify refresh token validity
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Generate new access token
    const accessToken = user.generateAccessToken();

    res.status(200).json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    next(error);
  }
};



