import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Shop from "../models/shop.model.js";
import Item from "../models/items.model.js";

dotenv.config({ path: "../.env" });

// Fetch data from DB and create chunks for RAG
async function fetchAndFormat() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const shops = await Shop.find({});
  const items = await Item.find({}).populate("shop");

  const chunks = [];

  // Shops
  shops.forEach((shop) => {
    chunks.push({
      id: `shop-${shop._id}`,
      type: "shop",
      text: `Shop: ${shop.name}
Location: ${shop.city}, ${shop.state}
Address: ${shop.address}
Phone: ${shop.phone || "N/A"}`,
    });
  });

  // Items
  items.forEach((item) => {
    chunks.push({
      id: `item-${item._id}`,
      type: "item",
      text: `Item: ${item.name}
Category: ${item.category}
Price: ₹${item.price}
Type: ${item.foodType}
Shop: ${item.shop?.name || "N/A"}
Shop Location: ${item.shop?.city || "N/A"}`,
    });
  });

  fs.writeFileSync("rag_chunks.json", JSON.stringify(chunks, null, 2));
  console.log("✅ Data written to rag_chunks.json");

  await mongoose.disconnect();
}

fetchAndFormat().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
