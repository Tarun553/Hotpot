import express from "express";
import { signUp, signIn, sendOtp, verifyOtp, resetPassword} from "../controllers/auth.controller.js";

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

export default router;