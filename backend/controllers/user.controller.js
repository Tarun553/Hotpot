import Item from "../models/items.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
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

export const searchShopsAndItems = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const searchRegex = new RegExp(q, 'i');
    let results = { shops: [], items: [] };

    if (type === 'all' || type === 'shops') {
      results.shops = await Shop.find({
        $or: [
          { name: searchRegex },
          { city: searchRegex },
          { address: searchRegex }
        ]
      }).populate('items').limit(10);
    }

    if (type === 'all' || type === 'items') {
      results.items = await Item.find({
        $or: [
          { name: searchRegex },
          { category: searchRegex }
        ]
      }).populate('shop', 'name city').limit(20);
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Search error", error: error.message });
  }
};
