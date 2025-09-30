import express from "express";
import { chatController } from "../controllers/chat.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Chat route is working!" });
});

router.post("/", chatController); // Temporarily removed auth for testing

export default router;