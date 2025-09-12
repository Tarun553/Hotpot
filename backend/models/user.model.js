import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
        required: true,
    },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      default: "user",
    },
    resetOtp: {
      type: String,
      
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
