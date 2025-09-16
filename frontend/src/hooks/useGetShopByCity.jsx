import { useEffect } from "react";
import { useDispatch } from "react-redux";

import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import { setShops } from "../redux/shopSlice";
const useGetShopByCity = () => {
  const { city } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/shop/city/${city}`, { withCredentials: true });
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
