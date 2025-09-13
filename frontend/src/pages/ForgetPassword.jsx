import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App"; // ✅ same serverUrl as login
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Enter OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // TODO: Replace with actual verify OTP API endpoint
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Enter new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // TODO: Replace with actual reset password API endpoint
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      toast.success("Password reset successful! You can now login.");
      // Optionally redirect to login page
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <h1 className="text-center text-3xl font-extrabold text-orange-600">
            Hotpot 🔥
          </h1>
          <CardTitle className="text-2xl font-bold text-center mt-2">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-center text-red-600 text-sm font-medium py-1">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 transition rounded-xl"
                disabled={loading}
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Send OTP"}
              </Button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  name="otp"
                  placeholder="Enter OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-center text-red-600 text-sm font-medium py-1">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 transition rounded-xl"
                disabled={loading}
              >
                {loading ? <ClipLoader size={20} color="#fff" /> : "Verify OTP"}
              </Button>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-center text-red-600 text-sm font-medium py-1">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 transition rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader size={20} color="#fff" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
          {/* Back to Login */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
