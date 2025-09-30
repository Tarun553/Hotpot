import Item from "../models/items.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudnary.js";

export const addItem = async (req, res) => {
    try {
        console.log("Add item request received");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("User ID:", req.userId);
        
        const { name, price, category, foodType } = req.body;
        
        // Validate required fields
        if (!name || !price || !category || !foodType) {
            return res.status(400).json({ 
                message: "Missing required fields", 
                received: { name, price, category, foodType } 
            });
        }
        
        let image;
        if (req.file) {
            console.log("Uploading image to Cloudinary...");
            image = await uploadOnCloudinary(req.file.path);
            console.log("Image uploaded:", image);
        }
        
        console.log("Finding shop for user:", req.userId);
        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            console.log("Shop not found for user:", req.userId);
            return res.status(404).json({ message: "Shop not found" });
        }
        console.log("Shop found:", shop._id);
        
        console.log("Creating item...");
        const item = await Item.create({
            name,
            image,
            price,
            category,
            foodType,
            shop: shop._id
        });
        console.log("Item created:", item._id);
        
        shop.items.push(item._id);
        await shop.save();
        console.log("Shop updated with new item");
        
        shop = await Shop.findById(shop._id)
          .populate('items')
          .populate('owner', '-password');
          
        console.log("Sending response...");
        res.status(201).json(shop);
    } catch (error) {
        console.error("Add item error:", error);
        res.status(500).json({ message: "add items error", error: error.message });
    }
}


export const editItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { name, price, category, foodType } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }
        const item = await Item.findByIdAndUpdate(itemId, {
            name,
            image,
            price,
            category,
            foodType,
            shop: shop._id
        }, { new: true });
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        shop = await Shop.findById(shop._id)
          .populate('items')
          .populate('owner', '-password');
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ message: "edit items error", error: error.message });
    }
}

export const getItemById = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        // Support both /:id and /:itemId
        const item = await Item.findById(id || itemId).populate('shop', '-owner');
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({ item });
    } catch (error) {
        res.status(500).json({ message: "get item by id error", error: error.message });
    }
}


export const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findByIdAndDelete(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        const shop = await Shop.findOne({ owner: req.userId });
        if (shop) {
            shop.items = shop.items.filter(i => i.toString() !== itemId);
            await shop.save();
            await shop.populate('items').populate('owner', '-password');
        }
        res.status(200).json({ message: "Item deleted successfully", shop });
    } catch (error) {
        res.status(500).json({ message: "delete item error", error: error.message });
    }
}

// export const getItemByCity = async (req, res) => {
//   try {
//       const { city } = req.params;
//       const shops = await Shop.find({ city: city.toLowerCase() })
//         .populate('items')
//         .populate('owner', '-password');
//       res.status(200).json({ shops });
//   } catch (error) {
//       res.status(500).json({ message: "get item by city error", error: error.message });
//   }
// }

// New controller to handle item rating


export const rateItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { value } = req.body;
    if (value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating value must be between 1 and 5" });
    }
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    // Check if user has already rated
    const existingRatingIndex = item.ratings.findIndex(r => r.user.toString() === userId);
    if (existingRatingIndex >= 0) {
      // Update existing rating
      item.ratings[existingRatingIndex].value = value;
    } else {
        // Add new rating
        item.ratings.push({ user: userId, value });
        item.rating.count += 1;
    }
    // Recalculate average rating
    const totalRating = item.ratings.reduce((sum, r) => sum + r.value, 0);
    item.rating.average = totalRating / item.rating.count;
    await item.save();
    res.status(200).json({ message: "Rating submitted", item });
  } catch (error) {
    res.status(500).json({ message: "Error rating item", error: error.message });
  }
};

export const getItemByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        if (!category || typeof category !== "string") {
            return res.status(400).json({ message: "Category is required and must be a string" });
        }

        let items;
        if (category.toLowerCase() === "all") {
            items = await Item.find().populate('shop', '-owner');
        } else {
            items = await Item.find({ category }).populate('shop', '-owner');
        }

        if (!items || items.length === 0) {
            return res.status(404).json({ message: "No items found for this category" });
        }

        res.status(200).json({ items });
    } catch (error) {
        res.status(500).json({ message: "get item by category error", error: error.message });
    }
};


export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find(); // Adjust model name if needed
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: "get all items error", error: error.message });
  }
};
