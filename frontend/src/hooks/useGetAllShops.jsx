import { useDispatch } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { setShopData } from "../redux/shopSlice";
import toast from "react-hot-toast";
import apiClient from "../utils/axios";

const useGetAllShops = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/shop/get-all-shops");
      if (response.data?.shops) {
        dispatch(setShopData(response.data.shops));
      }
    } catch (error) {
      console.error("Error fetching all shops:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch shops";
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
    fetchAllShops();
  }, [fetchAllShops]);

  return { loading, error, refetch: fetchAllShops };
};

export default useGetAllShops;
