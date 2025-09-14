import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/mail.js";

// export const signUp = async (req, res) => {
//   try {
//     const { fullName, email, password, role, mobile } = req.body;
//     console.log(fullName, email, password, role, mobile);
//     // check user input all the fields
//     if (!fullName || !email || !password || !role || !mobile) {
//       return res
//         .status(400)
//         .json({ message: "All fields are required", success: false });
//     }
//     // check if user already exists
//     const existingUser = await User.find({ email });
//     if (existingUser.length > 0) {
//       return res
//         .status(400)
//         .json({ message: "User already exists", success: false });
//     }
//     // hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // create new user
//     const newUser = new User({
//       fullName,
//       email,
//       password: hashedPassword,
//       role,
//       mobile,
//     });
//     await newUser.save();
//     // set cookies
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000,
//     });
//     // Remove password from user object
//     const userObj = newUser.toObject();
//     delete userObj.password;
//     return res.status(201).json({
//       message: "User created successfully",
//       success: true,
//       user: userObj,
//       token,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal server error", success: false });
//   }
// };

// export const signIn = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     // check user input all the fields
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "All fields are required", success: false });
//     }
//     // check if user exists
//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found", success: false });
//     }
//     // check if password is correct
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ message: "Invalid credentials", success: false });
//     }
//     // set cookies
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     res.cookie("token", token, { httpOnly: true });
//     // Remove password from user object
//     const userObj = user.toObject();
//     delete userObj.password;
//     return res.status(200).json({
//       message: "User signed in successfully",
//       success: true,
//       user: userObj,
//       token,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal server error", success: false });
//   }
// };

// export const sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;
//     // check user input all the fields
//     if (!email) {
//       return res
//         .status(400)
//         .json({ message: "Email is required", success: false });
//     }
//     // check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found", success: false });
//     }
//     // generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     user.resetOtp = otp;
//     user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
//     user.isOtpVerified = false;
//     await user.save();
//     // send email
//     await sendEmail(email, otp);
//     return res.status(200).json({
//       message: "OTP sent successfully",
//       success: true,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal server error", success: false });
//   }
// };

// export const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     // check user input all the fields
//     if (!email || !otp) {
//       return res
//         .status(400)
//         .json({ message: "Email and OTP are required", success: false });
//     }
//     // check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found", success: false });
//     }
//     // check if OTP is valid
//     if (user.resetOtp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP", success: false });
//     }
//     // check if OTP is expired
//     if (Date.now() > user.otpExpiry) {
//       return res
//         .status(400)
//         .json({ message: "OTP has expired", success: false });
//     }
//     // OTP is valid and not expired
//     user.isOtpVerified = true;
//     user.resetOtp = null;
//     user.otpExpiry = null;
//     await user.save();
//     return res.status(200).json({
//       message: "OTP verified successfully",
//       success: true,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal server error", success: false });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;
//     // check user input all the fields
//     if (!email || !newPassword) {
//       return res.status(400).json({
//         message: "Email and new password are required",
//         success: false,
//       });
//     }
//     // check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found", success: false });
//     }
//     // check if OTP is verified
//     if (!user.isOtpVerified) {
//       return res
//         .status(400)
//         .json({ message: "OTP is not verified", success: false });
//     }
//     // update password
//     user.password = await bcrypt.hash(newPassword, 10);
//     user.isOtpVerified = false;
//     await user.save();
//     return res.status(200).json({
//       message: "Password reset successfully",
//       success: true,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal server error", success: false });
//   }
// };

// export const GoogleAuth = async (req, res) => {
//   try {
//     const { fullName, email, role, mobile } = req.body;
//     // Validate required fields
//     if (!fullName || !email || !role || !mobile) {
//       return res.status(400).json({ message: "All fields are required", success: false });
//     }
//     let user = await User.findOne({ email });
//     if (user) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: "1d",
//       });
//       // Remove password from user object
//       const userObj = user.toObject();
//       delete userObj.password;
//       return res
//         .status(200)
//         .json({ message: "Login successful", success: true, token, user: userObj });
//     }
//     // if user does not exist, create a new user
//     // Set a random password for Google users (not used for login)
//     const randomPassword = Math.random().toString(36).slice(-8);
//     user = new User({
//       fullName,
//       email,
//       role,
//       mobile,
//       password: await bcrypt.hash(randomPassword, 10),
//     });
//     await user.save();
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "strict",
//     });
//     // Remove password from user object
//     const userObj = user.toObject();
//     delete userObj.password;
//     return res
//       .status(201)
//       .json({
//         message: "User created successfully",
//         success: true,
//         token,
//         user: userObj,
//       });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error google auth error", success: false });
//   }
// };


// ---------- SIGN UP ----------
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role, mobile } = req.body;
    if (!fullName || !email || !password || !role || !mobile) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword, role, mobile });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({ message: "User created successfully", success: true, user: userObj, token });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};

// ---------- SIGN IN ----------
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ message: "User signed in successfully", success: true, user: userObj, token });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};

// ---------- SEND OTP ----------
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();

    await sendEmail(email, otp);

    return res.status(200).json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};

// ---------- VERIFY OTP ----------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired", success: false });
    }

    user.isOtpVerified = true;
    user.resetOtp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};

// ---------- RESET PASSWORD ----------
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    if (!user.isOtpVerified) {
      return res.status(400).json({ message: "OTP is not verified", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};

// ---------- GOOGLE AUTH ----------
export const GoogleAuth = async (req, res) => {
  try {
    const { fullName, email, role, mobile } = req.body;
    if (!fullName || !email || !role || !mobile) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    let user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(200).json({ message: "Login successful", success: true, token, user: userObj });
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    user = new User({
      fullName,
      email,
      role,
      mobile,
      password: await bcrypt.hash(randomPassword, 10),
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ message: "User created successfully", success: true, token, user: userObj });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error google auth", success: false });
  }
};

// ---------- LOGOUT ----------
export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error", success: false });
  }
};