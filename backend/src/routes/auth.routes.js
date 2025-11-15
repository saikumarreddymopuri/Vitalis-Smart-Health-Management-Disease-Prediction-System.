import express from "express";
import passport from "passport";

const router = express.Router();

// Step 1: Redirect to Google
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

// Step 2: Google callback
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  (req, res) => {
    const user = req.user;
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .redirect(`${process.env.CLIENT_URL}/google-success?token=${accessToken}`);
  }
);

export default router;
