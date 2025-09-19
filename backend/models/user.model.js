import mongoose from "mongoose";

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

    // ✅ GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON type must be "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },
  },
  { timestamps: true }
);

// ✅ Create 2dsphere index for geo queries
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;
