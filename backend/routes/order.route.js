import express from "express";
import { 
  placeOrder, 
  getUserOrders, 
  getOrderById,
  getShopOrders ,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Place a new order
router.post("/place", isAuth, placeOrder);

// Get user's orders
router.get("/user", isAuth, getUserOrders);


// Get orders for shop owner
router.get("/shop-orders", isAuth, getShopOrders);
// Get order by ID
router.get("/:orderId", isAuth, getOrderById);
// Update order status (for shop owners) - New route
router.put("/:orderId/:shopId/status", isAuth, updateOrderStatus);

export default router;