import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"; // ✅ Google icon
import axios from "axios";
import { serverUrl } from "../App"; // Import the serverUrl

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    // ✅ call your backend API
    const result = await axios.post(
      `${serverUrl}/api/auth/login`,
      formData,
      { withCredentials: true }
    );
    console.log(result.data);
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          {/* App name */}
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

              {/* ✅ Forgot Password Link */}
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
              Login
            </Button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-300"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </Button>

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
