import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendVerificationEmail } from "../utils/email.js";

// REGISTER USER (Manual)
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, phone, role } = req.body;
  // const avatarLocalPath = req.file?.path;
  const avatarBuffer = req.file?.buffer;


  if (!fullName || !username || !email || !password || !avatarBuffer || !phone) {
    throw new ApiError(400, "All fields are required including avatar.");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(409, "User already exists with given email or username.");
  }

  // const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  const avatarUpload = await uploadOnCloudinary(avatarBuffer);

  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    phone,
    role: role || "User", // Default to "User" if not provided
    avatar: avatarUpload.url,
  });

  // Generate email verification token
  const emailToken = user.generateEmailToken();

  // 🥳 Send Welcome Email
  await sendWelcomeEmail(user.email, user.fullName);

  // --- THIS IS THE FIX ---
  // We now use an environment variable instead of a hard-coded IP
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  const verificationLink = `${backendUrl}/api/v1/users/verify/${emailToken}`;
  // --- END OF FIX ---

  // Send verification email
  await sendVerificationEmail(user.email, user.username, verificationLink);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

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

// Verify Email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  // --- THIS IS THE BETTER FIX (FOR THE FRONTEND) ---
  // We need to know where your frontend login page is
  const frontendLoginUrl = process.env.CLIENT_URL_LOGIN || "http://localhost:5173/login"; // Use your frontend's login URL

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(400, "User not found");
    }

    if (user.isVerified) {
      // User is already verified, just redirect them
      return res.redirect(frontendLoginUrl + "?message=Email+already+verified");
    }

    user.isVerified = true;
    await user.save();

    // SUCCESS! Redirect them to the login page with a success message
    return res.redirect(frontendLoginUrl + "?message=Email+verified+successfully!+Please+login.");
    
  } catch (err) {
    // FAILED! Redirect them to the login page with an error
    return res.redirect(frontendLoginUrl + "?error=Invalid+or+expired+token");
  }
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

  if (!user.isVerified) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Email not verified"));
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userData = await User.findById(user._id).select(
    "-password -refreshToken"
  );

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
      new ApiResponse(
        200,
        { user: userData, token: accessToken },
        "Login successful"
      )
    );
});

//get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, { user }));
});

// LOGOUT USER
export const logoutUser = async (req, res, next) => {
  try {
    // Accept refreshToken from 3 places:
    const refreshToken =
      req.cookies?.refreshToken || 
      req.header("x-refresh-token") ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!refreshToken) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Already logged out")); 
    }

    // Find user with that token
    const user = await User.findOne({ refreshToken });

    // If no user found, still allow logout (to avoid 401)
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Clear cookies properly for Vercel
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};


// refresh access token
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req.header("x-refresh-token");

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = user.generateAccessToken();

    res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  } catch (error) {
    next(error);
  }
};

// ADMIN CONTROLLERS
// ADMIN: Get all users (role: "User")
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "User" }).select(
    "-password -refreshToken -__v"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

// ADMIN: Get all operators (role: "Operator")
export const getAllOperators = asyncHandler(async (req, res) => {
  const operators = await User.find({ role: /operator/i }).select(
    "-password -refreshToken -__v"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, operators, "All operators fetched successfully"));
});

// ADMIN: Get details for a single user by ID
export const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -refreshToken -__v");

  if (!user) {
    throw new ApiError( "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});

// ADMIN: Update a user's details by ID
export const updateUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, username, email, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        fullName,
        username,
        email,
        phone,
      },
    },
    { new: true }
  ).select("-password -refreshToken -__v");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

// ADMIN: Delete a user by ID
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, "Admin cannot delete themselves");
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});


// UPDATE CURRENT USER PROFILE
export const updateCurrentUser = asyncHandler(async (req, res) => {
  // We only allow updating these two fields for security
  const { fullName, phone } = req.body;

  if (!fullName || !phone) {
    throw new ApiError(400, "Full name and phone number are required");
  }

  // Find the user by their ID (from the JWT token) and update them
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id, // This comes from verifyJWT, it's secure
    {
      $set: {
        fullName: fullName,
        phone: phone,
      },
    },
    { new: true } // This returns the new, updated document
  ).select("-password -refreshToken -__v"); // Don't send back sensitive data

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  // Send back the updated user
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});