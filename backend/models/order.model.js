import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: { type: Number },
  price: { type: Number },
});

const shopOrderSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subtotal: { type: Number },
  shopOrderItems: [shopOrderItemSchema],

  // ✅ status per shop order
  status: {
    type: String,
    enum: ["pending", "accepted", "preparing", "on the way", "delivered", "cancelled"],
    default: "pending",
  },

  // ✅ history of status changes
  statusHistory: [
    {
      status: { type: String, required: true },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  assigment: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryAssignment", default: null },
  
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethod: { type: String, required: true, enum: ["cod", "online"] },
    deliveryAddress: { text: String, latitude: Number, longitude: Number },
    totalAmount: { type: Number, required: true },
    shopOrder: [shopOrderSchema],
    
    // ✅ Delivery OTP fields
    deliveryOtp: {
      type: String,
      default: null
    },
    otpGeneratedAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "on the way", "delivered", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
        