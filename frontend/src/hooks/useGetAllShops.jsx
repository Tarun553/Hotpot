import { useDispatch } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { setShopData } from "../redux/shopSlice";
import { serverUrl } from "../App";

const useGetAllShops = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllShops = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/shop/get-all-shops`, { withCredentials: true });
        console.log(response.data.shops);
        dispatch(setShopData(response.data.shops));
      } catch (error) {
        console.error("Error fetching all shops:", error);
      }
    };

    fetchAllShops();
  }, [dispatch]);
};

export default useGetAllShops;
