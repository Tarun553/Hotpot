import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setShops } from "../redux/shopSlice";
import apiClient from "../utils/axios";

const useGetShopByCity = () => {
  const { city } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await apiClient.get(`/api/shop/city/${city}`);
        dispatch(setShops(response.data.shops));
        console.log("Fetched shops by city:", response.data.shops);
      } catch (error) {
        console.error("Error fetching shops by city:", error);
      }
    };

    if (city) {
      fetchShops();
    }
  }, [city, dispatch]);
};

export default useGetShopByCity;
