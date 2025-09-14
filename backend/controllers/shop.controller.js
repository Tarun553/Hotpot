import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudnary.js";

export const upsertShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    const owner = req.userId;
    if (!name || !city || !state || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    // Find shop by owner
    let shop = await Shop.findOne({ owner });
    if (shop) {
      // Edit shop
      shop.name = name;
      shop.city = city;
      shop.state = state;
      shop.address = address;
      if (image) shop.image = image;
      await shop.save();
      await shop.populate('owner', '-password');
      return res.status(200).json({ message: "Shop updated successfully", shop });
    } else {
      // Create shop
      shop = await Shop.create({
        name,
        image,
        city,
        state,
        address,
        owner,
      });
      await shop.populate('owner', '-password');
      return res.status(201).json({ message: "Shop created successfully", shop });
    }
  } catch (error) {
    console.error("Error upserting shop:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getShopByOwner = async (req, res) => {
  try {
    const owner = req.userId;
    const shop = await Shop.findOne({ owner }).populate('owner', '-password');
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    return res.status(200).json({ shop });
  } catch (error) {
    console.error("Error fetching shop by owner:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
