import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMyShopData } from "@/redux/ownerSlice";
import apiClient from "../utils/axios";

const useGetMyShop = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchShop = async () => {
			try {
				const res = await apiClient.get('/api/shop/owner');
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
