const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const passport = require("passport");
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleCallback,
  resendVerification,
} = require("../controllers/auth.controller");

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DevFlow Auth API is operational",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      logout: "POST /api/auth/logout",
      me: "GET /api/auth/me",
      forgotPassword: "POST /api/auth/forgot-password",
      resetPassword: "POST /api/auth/reset-password/:token",
      verifyEmail: "GET /api/auth/verify-email/:token",
      resendVerification: "POST /api/auth/resend-verification",
      google: "GET /api/auth/google",
    },
  });
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

const clientUrl = process.env.CLIENT_URL || "https://dev-flow-zeta-ashy.vercel.app";

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${clientUrl}/login?error=AuthenticationFailed` }),
  googleCallback
);

module.exports = router;
