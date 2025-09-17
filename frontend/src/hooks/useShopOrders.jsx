import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setShopOrders } from "../redux/userSlice";
import { serverUrl } from "../App";
import toast from "react-hot-toast";

const useShopOrders = () => {
  const dispatch = useDispatch();
    const fetchShopOrders = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/orders/shop-orders`, {
        withCredentials: true,
      });
      console.log(response.data);
      dispatch(setShopOrders(response.data));
    } catch (error) {
      console.error("Error fetching shop orders:", error);
      toast.error("Failed to fetch shop orders");
    }
  };

  useEffect(() => {
    fetchShopOrders();
  }, []);

  return null;
};

export default useShopOrders;
