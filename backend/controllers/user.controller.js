import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId);
    if (!userId) {
      return res.status(400).json({ message: "userId is not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }
    return res.status(200).json({ message: "user found", user });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error" });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { lat, long } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is not found" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { location: { type: "Point", coordinates: [long, lat] } },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }
    return res
      .status(200)
      .json({ message: "Location updated successfully", user });
  } catch (error) {
    return res.status(400).json({ message: "Internal server error" });
  }
};
