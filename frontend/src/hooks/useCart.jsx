import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { addToCart, removeToCart, updateToCart } from "../redux/userSlice";
import { setCartItems } from "../redux/userSlice";
import toast from "react-hot-toast";


const useCart = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);

  const addItemToCart = async (item) => {
    try {
      const response = await axios.post(`${serverUrl}/api/cart/add`, item, { withCredentials: true });
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
      toast.success("Item added to cart");
    } catch (error) {
      toast.error("Error adding item to cart");
    }
  };

  const getCartByUser = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/cart`, { withCredentials: true });
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
    } catch (error) {
      toast.error("Error fetching cart");
    }
  };

  const removeItemFromCart = async (itemId) => {
    try {
      const response = await axios.delete(`${serverUrl}/api/cart/remove/${itemId}`, { withCredentials: true });
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Error removing item from cart");
    }
  };

  const updateItemInCart = async (itemId, quantity) => {
    try {
      const response = await axios.put(`${serverUrl}/api/cart/update`, { itemId, quantity }, { withCredentials: true });
      dispatch(setCartItems(response.data.items || response.data.cartItems || []));
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Error updating cart");
    }
  };

  return { cartItems, addItemToCart, removeItemFromCart, updateItemInCart, getCartByUser };
};

export default useCart;
