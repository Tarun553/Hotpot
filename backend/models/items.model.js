import mongoose from "mongoose";
import { embedAndUpsert } from "../utils/ai.js";

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

// Auto-embed after saving a new item
itemSchema.post("save", async function (doc) {
  await embedAndUpsert({
    id: `item-${doc._id}`,
    type: "item",
    text: `Item: ${doc.name}
Category: ${doc.category}
Price: ₹${doc.price}
Type: ${doc.foodType}
Shop: ${doc.shop?.name || "N/A"}
Shop Location: ${doc.shop?.city || "N/A"}`,
  });
});

export default mongoose.model("Item", itemSchema);
