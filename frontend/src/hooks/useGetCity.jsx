import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity, setCurrentState, setCurrentAddress } from "@/redux/userSlice";
import { setLocation, setAddress } from "../redux/mapSlice";

const GEOAPIKEY = import.meta.env.VITE_GEOAPIKEY;

const getCityFromCoords = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEOAPIKEY}`
    );
    const data = await response.json();
    const result = data?.results?.[0] || {};
    const city = result.city || result.state || "Unknown";
    const state = result.state || "Unknown";
    const address =
      result.address_line2 ||
      result.address_line1 ||
      result.formatted ||
      "Unknown";

    return { city, state, address };
  } catch {
    return { city: "Unknown", state: "Unknown", address: "Unknown" };
  }
};

const useGetCity = () => {
  const [city, setCityState] = useState("");
  const [state, setState] = useState("");
  const [address, setAddressState] = useState("");
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
        const {
          city: foundCity,
          state: foundState,
          address: foundAddress,
        } = await getCityFromCoords(latitude, longitude);
        dispatch(setAddress(foundAddress));
        setCityState(foundCity);
        setState(foundState);
        setAddressState(foundAddress);
        dispatch(setCity(foundCity));
        dispatch(setCurrentState(foundState));
        dispatch(setCurrentAddress(foundAddress));
        dispatch(setLocation({ lat: latitude, long: longitude }));

        setLoading(false);
      },
      (err) => {
        setError("Unable to get location");
        setLoading(false);
      }
    );
  }, [dispatch]);

  return { city, state, address, loading, error };
};

export default useGetCity;
