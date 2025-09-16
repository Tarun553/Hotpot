import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
  try {
    // console.log("Cookies:", req.cookies.token); // Debugging line to check cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded:", decoded);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }
    console.log("decoded:", decoded);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
