import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setMyShopData } from "@/redux/ownerSlice";
import { serverUrl } from "../App";

const useGetMyShop = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchShop = async () => {
			try {
				const res = await axios.get(`${serverUrl}/api/shop/owner`, { withCredentials: true });
				dispatch(setMyShopData(res.data.shop));
			} catch (err) {
				dispatch(setMyShopData(null));
			}
		};
		fetchShop();
	}, [dispatch]);
};

export default useGetMyShop;
