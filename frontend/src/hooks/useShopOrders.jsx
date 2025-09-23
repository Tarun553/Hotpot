import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setShopOrders } from "../redux/userSlice";
import toast from "react-hot-toast";
import apiClient from "../utils/axios";

const useShopOrders = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShopOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/orders/shop-orders");
      console.log(response.data);
      dispatch(setShopOrders(response.data));
    } catch (error) {
      console.error("Error fetching shop orders:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch shop orders";
      setError(errorMessage);
      
      // Don't show error toast if user is not authenticated
      if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchShopOrders();
  }, [fetchShopOrders]);

  return { loading, error, refetch: fetchShopOrders };
};

export default useShopOrders;
