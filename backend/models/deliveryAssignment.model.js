import mongoose from "mongoose";


const deliveryAssignmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  shopOrderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  assignedAt: { type: Date, default: Date.now },
  broadcastedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  assignedTo:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: {
    type: String,
    enum: ["broadcasted", "assigned", "completed"],
    default: "broadcasted",
  }
});

const DeliveryAssignment = mongoose.model(
  "DeliveryAssignment",
  deliveryAssignmentSchema
);

export default DeliveryAssignment;
