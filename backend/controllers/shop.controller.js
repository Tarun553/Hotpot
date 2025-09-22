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
    console.log(image, name, city, state, address);

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
      await shop.populate([
        { path: 'owner', select: '-password' },
        { path: 'items' }
      ]);
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
    console.log(owner);
    if (!owner) {
      return res.status(400).json({ message: "Owner ID is not found" });
    }
    const shop = await Shop.findOne({ owner })
      .populate('items')
      .populate('owner', '-password');
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    return res.status(200).json({ shop });
  } catch (error) {
    console.error("Error fetching shop by owner:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate('items')
      .populate('owner', '-password');
    return res.status(200).json({ shops });
  } catch (error) {
    console.error("Error fetching all shops:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    // Escape special regex characters in city input
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const shops = await Shop.find({ city: { $regex: escapedCity, $options: "i" } })
      .populate('items')
      .populate('owner', '-password');
      if (!shops || shops.length === 0) {
        return res.status(404).json({ message: "No shops found in this city" });
      }
    return res.status(200).json({ shops });
  } catch (error) {
    console.error("Error fetching shops by city:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    // Only query if id is a valid ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid shop ID" });
    }
    const shop = await Shop.findById(id)
      .populate('items')
      .populate('owner', '-password');
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    return res.status(200).json({ shop });
  } catch (error) {
    console.error("Error fetching shop by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
