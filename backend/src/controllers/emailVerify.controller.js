// import jwt from 'jsonwebtoken';
// import { User } from '../models/user.model.js';
// import { asyncHandler } from '../utils/asyncHandler.js';

// export const verifyEmail = asyncHandler(async (req, res) => {
//   const token = req.query.token;

//   if (!token) throw new ApiError(400, "Verification token missing");

//   const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
//   const user = await User.findById(decoded._id);

//   if (!user) throw new ApiError(404, "User not found");

//   if (user.isVerified) return res.send("Email already verified");

//   user.isVerified = true;
//   await user.save();

//   res.redirect(`${process.env.CLIENT_URL}/email-verified-success`); // frontend page
// });
