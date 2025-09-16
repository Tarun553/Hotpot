import Item from "../models/items.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudnary.js";

export const addItem = async (req, res) => {
    try {
        const { name, price, category, foodType } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }
        const item = await Item.create({
            name,
            image,
            price,
            category,
            foodType,
            shop: shop._id
        });
        shop.items.push(item._id);
        await shop.save();
        shop = await Shop.findById(shop._id)
          .populate('items')
          .populate('owner', '-password');
        res.status(201).json(shop);
    } catch (error) {
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
