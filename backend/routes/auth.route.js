import express from "express";
import { signUp, signIn, sendOtp, verifyOtp, resetPassword, GoogleAuth, logout} from "../controllers/auth.controller.js";
import { log } from "console";

const router = express.Router();

// Register route
router.post("/register", signUp);

// Login route
router.post("/login", signIn);
// Forgot Password - Send OTP
router.post("/forgot-password", sendOtp);
// Verify OTP
router.post("/verify-otp", verifyOtp);
// Reset Password
router.post("/reset-password", resetPassword);
// Google OAuth route
router.post("/google-auth", GoogleAuth);
// Logout route
router.post("/logout", logout);

export default router;