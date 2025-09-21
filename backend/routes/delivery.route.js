import express from "express";
import { 
  getAvailableDeliveries, 
  acceptDelivery, 
  getMyDeliveries, 
  completeDelivery 
} from "../controllers/order.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Routes for delivery boys
router.get("/available", isAuth, getAvailableDeliveries);
router.post("/accept/:assignmentId", isAuth, acceptDelivery);
router.get("/my-deliveries", isAuth, getMyDeliveries);
router.post("/complete/:assignmentId", isAuth, completeDelivery);

export default router;