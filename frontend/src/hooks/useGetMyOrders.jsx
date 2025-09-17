import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const fetchMyOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await axios.get(`${serverUrl}/api/orders/user`, {
        withCredentials: true,
      });
      console.log(result.data)
      dispatch(setMyOrders(result.data));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders.");
      toast.error(err.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  return { loading, error };
};

export default useGetMyOrders;
