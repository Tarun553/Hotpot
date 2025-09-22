import { useDispatch, useSelector } from "react-redux";
import { setCartItems } from "../redux/userSlice";
import toast from "react-hot-toast";
import apiClient from "../utils/axios";
import { useState, useCallback } from "react";

const useCart = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const addItemToCart = useCallback(async (item) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/api/cart/add", item);
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
      toast.success("Item added to cart");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      const message = error.response?.data?.message || "Error adding item to cart";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const getCartByUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/cart");
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Don't show error toast for fetching cart as it might be expected (empty cart)
      if (error.response?.status !== 404) {
        toast.error("Error fetching cart");
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const removeItemFromCart = useCallback(async (itemId) => {
    setLoading(true);
    try {
      const response = await apiClient.delete(`/api/cart/remove/${itemId}`);
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      const message = error.response?.data?.message || "Error removing item from cart";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateItemInCart = useCallback(async (itemId, quantity) => {
    setLoading(true);
    try {
      const response = await apiClient.put("/api/cart/update", { itemId, quantity });
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
      toast.success("Cart updated");
    } catch (error) {
      console.error("Error updating cart:", error);
      const message = error.response?.data?.message || "Error updating cart";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return { cartItems, addItemToCart, removeItemFromCart, updateItemInCart, getCartByUser, loading };
};

export default useCart;
