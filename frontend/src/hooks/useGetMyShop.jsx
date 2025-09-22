import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setMyShopData } from "@/redux/ownerSlice";
import { serverUrl } from "../utils/constants";

const useGetMyShop = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchShop = async () => {
			try {
				const res = await axios.get(`${serverUrl}/api/shop/owner`, { withCredentials: true });
				console.log("Shop API Response:", res.data);
				dispatch(setMyShopData(res.data.shop));
			} catch (err) {
				console.error("Error fetching shop:", err.response?.data || err.message);
				dispatch(setMyShopData(null));
			}
		};
		fetchShop();
	}, [dispatch]);
};

export default useGetMyShop;
