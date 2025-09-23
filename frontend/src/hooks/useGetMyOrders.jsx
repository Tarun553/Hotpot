import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "../utils/axios";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMyOrders = useCallback(async () => {
    console.log("🔄 useGetMyOrders: Starting to fetch orders");
    console.log("👤 useGetMyOrders: Current user data:", userData);
    
    if (!userData) {
      console.log("⚠️ useGetMyOrders: No user data found, skipping fetch");
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log("📞 useGetMyOrders: Making API call to /api/orders/user");
      const result = await apiClient.get("/api/orders/user");
      console.log("✅ useGetMyOrders: Successfully fetched orders:", result.data);
      dispatch(setMyOrders(result.data));
    } catch (err) {
      console.error("❌ useGetMyOrders: Error fetching orders:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch orders.";
      setError(errorMessage);
      
      // Don't show error toast if user is not authenticated (handled by interceptor)
      if (err.response?.status !== 401) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, userData]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return { loading, error, refetch: fetchMyOrders };
};

export default useGetMyOrders;
