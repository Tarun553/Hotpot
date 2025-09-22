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
import { FcGoogle } from "react-icons/fc"; // ✅ Google icon
import axios from "axios";
import { serverUrl } from "../App"; // Import the serverUrl
import { auth, provider } from "../../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserData, setToken } from "../redux/userSlice";
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // Handle input changes

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/register`, formData, { withCredentials: true });
         
      dispatch(setUserData(result.data.user));
      if (result.data.token) {
        dispatch(setToken(result.data.token));
      }
      // You can handle success here (e.g., redirect, show success message)
      if(result.data.success){
       toast.success("Registered Successfully")
        navigate("/login");
      }
    } catch (err) {
      let msg = "Registration failed";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
        toast.error(msg)
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!formData.mobile) {
      return alert("Please enter mobile number");
    }
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        try {
          const response = await axios.post(`${serverUrl}/api/auth/google-auth`, {
            fullName: user.displayName,
            email: user.email,
            mobile: formData.mobile,
            role: formData.role,
          });
          dispatch(setUserData(response.data));
          if (response.data.success) {
            toast.success("Logged in successfully");
            navigate("/");
          }
        } catch (error) {
          console.error(error);
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error(error);
      });
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
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Mobile */}
            <div>
              <Label htmlFor="mobile">Mobile</Label>
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

            {/* Role */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="deliveryBoy">Delivery Boy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center text-red-600 text-sm font-medium py-1">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 transition rounded-xl"
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "Register"}
            </Button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Signup */}
          <Button
            onClick={handleGoogleSignUp}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-300"
          >
            <FcGoogle className="text-xl" />
            Sign up with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
