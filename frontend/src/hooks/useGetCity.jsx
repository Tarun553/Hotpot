import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity } from "@/redux/userSlice";

const GEOAPIKEY = import.meta.env.VITE_GEOAPIKEY;

const getCityFromCoords = async (lat, lon) => {
	try {
		const response = await fetch(
			`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEOAPIKEY}`
		);
		const data = await response.json();
		const city = data?.results?.[0]?.city || data?.results?.[0]?.state || "Unknown";
		return city;
	} catch {
		return "Unknown";
	}
};


const useGetCity = () => {
	const [city, setCityState] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!navigator.geolocation) {
			setError("Geolocation not supported");
			setLoading(false);
			return;
		}
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const { latitude, longitude } = pos.coords;
				const foundCity = await getCityFromCoords(latitude, longitude);
				setCityState(foundCity);
				dispatch(setCity(foundCity));
				setLoading(false);
			},
			(err) => {
				setError("Unable to get location");
				setLoading(false);
			}
		);
	}, [dispatch]);

	return { city, loading, error };
};

export default useGetCity;
