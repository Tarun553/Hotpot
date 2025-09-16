import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      name: { type: String },
      image: { type: String },
      shop: { type: String },
      foodType: { type: String },
    }
  ],
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
