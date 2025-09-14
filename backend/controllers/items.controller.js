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
        const shop = await Shop.findOne({ owner: req.userId });
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
        res.status(201).json(item);
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
        const item = await Item.findByIdAndUpdate(itemId, {
            name,
            image,
            price,
            category,
            foodType
        }, { new: true });
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "edit items error", error: error.message });
    }
}
