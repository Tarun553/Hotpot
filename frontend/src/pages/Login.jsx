import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"; // ✅ Google icon
import axios from "axios";
import { serverUrl } from "../utils/constants"; // Import the serverUrl
import { auth } from "../../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserData, setToken } from "../redux/userSlice";

const Login = () => {
  const dispatch = useDispatch();
  const roles = ["user", "owner", "deliveryBoy"];
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobile: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Fixed: closed properly
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/login`, formData, {
        withCredentials: true,
      });
     
      dispatch(setUserData(result.data.user));
      if (result.data.token) {
        dispatch(setToken(result.data.token));
      }
      if (result.data.success) {
        setFormData({ email: "", password: "", mobile: "", role: "user" });
        toast.success("User logged in successfully");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
      toast.error("error occured")
    } finally {
      setLoading(false);
    }
  };

  // ✅ Now separate from handleSubmit
  const handleGoogleSignIn = async () => {
    setError("");
    if (!formData.mobile) {
      setError("Please enter your mobile number before signing in with Google.");
      return;
    }
    signInWithPopup(auth, new GoogleAuthProvider())
      .then(async (result) => {
        const user = result.user;
        if (!user || !user.email) {
          setError("Google sign-in failed. No email found.");
          return;
        }
        try {
          const response = await axios.post(
            `${serverUrl}/api/auth/google-auth`,
            {
              fullName: user.displayName,
              email: user.email,
              role: formData.role || "user",
              mobile: formData.mobile,
            }
          );
          console.log(response.data);
        } catch (error) {
          setError(error.response?.data?.message || "Google sign-in failed.");
        }
      })
      .catch((error) => {
        setError("Google sign-in failed.");
        console.error(error);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <h1 className="text-center text-3xl font-extrabold text-orange-600">
            Hotpot 🔥
          </h1>
          <CardTitle className="text-2xl font-bold text-center mt-2">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 transition rounded-xl"
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "Login"}
            </Button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Role dropdown */}
          <div className="mb-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile input */}
          <div className="mb-2">
            <Label htmlFor="mobile">Mobile (required for Google login)</Label>
            <Input
              id="mobile"
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          {/* Google Login */}
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-300"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </Button>

          {/* Error */}
          {error && (
            <div className="text-center text-red-600 text-sm font-medium py-1">
              {error}
            </div>
          )}

          {/* Register link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-orange-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
