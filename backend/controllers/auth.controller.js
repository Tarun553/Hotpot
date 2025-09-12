import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role, mobile } = req.body;
    // check user input all the fields
    if (!fullName || !email || !password || !role || !mobile) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    // check if user already exists
    const existingUser = await User.find({ email });
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      mobile,
    });
    await newUser.save();
    // set cookies
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res
      .status(201)
      .json(
        { message: "User created successfully", success: true },
        newUser,
        token
      );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check user input all the fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    // set cookies
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { httpOnly: true });
    return res
      .status(200)
      .json({ message: "User signed in successfully", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
