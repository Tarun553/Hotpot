import Item from "../models/items.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import { io } from "../index.js";
import { emitLocationUpdate } from "../socket/event.js";
import Order from "../models/order.model.js";
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

export const updateLocation = async (req, res) => {
  try {
    const { lat, long } = req.body;
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: "Point",
          coordinates: [parseFloat(long), parseFloat(lat)]
        }
      },
      { new: true }
    );

    // If delivery boy, emit location to active order customers
    if (user.role === 'deliveryBoy') {
      const activeOrders = await Order.find({
        'shopOrder.assigment': { $exists: true },
        orderStatus: { $in: ['confirmed', 'preparing', 'on the way'] }
      }).populate('shopOrder.assigment');

      const userActiveOrders = activeOrders.filter(order =>
        order.shopOrder.some(so => 
          so.assigment?.assignedTo?.toString() === userId.toString()
        )
      );

      if (userActiveOrders.length > 0) {
        emitLocationUpdate(io, userId, user.location, userActiveOrders);
      }
    }

    res.json({ message: "Location updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
