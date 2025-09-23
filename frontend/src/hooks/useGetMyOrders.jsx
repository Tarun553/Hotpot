import { useDispatch } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "../utils/axios";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.get("/api/orders/user");
      console.log(result.data);
      dispatch(setMyOrders(result.data));
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch orders.";
      setError(errorMessage);
      
      // Don't show error toast if user is not authenticated (handled by interceptor)
      if (err.response?.status !== 401) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return { loading, error, refetch: fetchMyOrders };
};

export default useGetMyOrders;
