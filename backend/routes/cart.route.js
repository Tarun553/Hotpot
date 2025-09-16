import { getCartByUser, removeCartItem, clearCart, addToCart, updateCartItem } from "../controllers/cart.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import express from "express";  

const cartRouter = express.Router();

cartRouter.get("/", isAuth, getCartByUser);
cartRouter.post("/add", isAuth, addToCart);
cartRouter.put("/update", isAuth, updateCartItem);
cartRouter.delete("/remove/:itemId", isAuth, removeCartItem);
cartRouter.delete("/clear", isAuth, clearCart);

export default cartRouter;