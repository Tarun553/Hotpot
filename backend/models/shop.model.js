import mongoose from "mongoose";
import { embedAndUpsert } from "../utils/ai.js";

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
});

// Auto-embed after saving a new shop
shopSchema.post("save", async function (doc) {
  await embedAndUpsert({
    id: `shop-${doc._id}`,
    type: "shop",
    text: `Shop: ${doc.name}
Location: ${doc.city}, ${doc.state}
Address: ${doc.address}
Phone: ${doc.phone || "N/A"}`,
  });
});

export default mongoose.model("Shop", shopSchema);
