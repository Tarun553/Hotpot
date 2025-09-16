import Cart from "../models/cart.model.js";

export const getCartByUser = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId }).populate("items.itemId");
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
};
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, quantity, price, name, image, shop, foodType } = req.body;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      const existingItem = cart.items.find(item => item.itemId.toString() === itemId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ itemId, quantity, price, name, image, shop, foodType });
      }
      await cart.save();
      res.status(200).json(cart);
    } else {
      const newCart = new Cart({
        userId,
        items: [{ itemId, quantity, price, name, image, shop, foodType }]
      });
      await newCart.save();
      res.status(201).json(newCart);
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, quantity } = req.body;
    console.log("from updateCart", itemId, quantity);

    const cart = await Cart.findOne({ userId });
    if (cart) {
    //   // Debug: log all itemIds in cart
    //   console.log("Cart itemIds:", cart.items.map(item => item.itemId.toString()));
      // Ensure both sides are strings
      const existingItem = cart.items.find(item => item.itemId.toString() === String(itemId));
      if (existingItem) {
        existingItem.quantity = quantity;
        await cart.save();
        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: "Item not found in cart" });
      }
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating cart item", error });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    // Accept itemId from req.params for DELETE /remove/:itemId
    const itemId = req.params.itemId || req.body.itemId;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter(item => item.itemId.toString() !== itemId);
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error removing cart item", error });
  }
};
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error });
  }
};