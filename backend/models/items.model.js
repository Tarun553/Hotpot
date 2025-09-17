import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "snacks",
        "main course",
        "pizza",
        "burger",
        "sandwich",
        "desserts",
        "beverages",
        "fast food",
        "north indian",
        "south indian",
        "chinese",
        "italian",
        "others",
      ],
    },
    price: { type: Number, required: true, min: 0 },
    foodType: { type: String, required: true, enum: ["veg", "non-veg"] },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
