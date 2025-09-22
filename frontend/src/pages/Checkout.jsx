
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useCart from "../hooks/useCart";
import { useDispatch, useSelector } from "react-redux";
import { setLocation as setMapLocation, setAddress as setMapAddress } from "@/redux/mapSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate  = useNavigate();
  const { cartItems } = useCart();
  const dispatch = useDispatch();
  const { location, address } = useSelector((state) => state.map);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const markerRef = useRef(null);
  const gmapRef = useRef(null);
  const [locating, setLocating] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  
  
  
  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post(`${serverUrl}/api/orders/place`,  {
        paymentMethod,
        deliveryAddress: {
          text: address,
          latitude: location.lat,
          longitude: location.long,
        },
      }, { withCredentials: true });

      if (response.status === 201) {
        navigate("/order-placed");
        // Clear cart and reset state
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order");
    }
  };

  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: location.lat ?? 0, lng: location.long ?? 0 },
      zoom: location.lat && location.long ? 15 : 2,
      mapId: "68d1df75554dc0ab2b568beb",
    });
    gmapRef.current = map;

    // Draggable marker using classic Marker for drag events
    const marker = new window.google.maps.Marker({
      position: { lat: location.lat ?? 0, lng: location.long ?? 0 },
      map,
      draggable: true,
      title: address || "Delivery Location",
    });
    markerRef.current = marker;

    // Drag end: reverse geocode and update store
    marker.addListener("dragend", async () => {
      const pos = marker.getPosition();
      if (!pos) return;
      const lat = pos.lat();
      const lng = pos.lng();
      dispatch(setMapLocation({ lat, long: lng }));

      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const formatted = results[0].formatted_address;
            dispatch(setMapAddress(formatted));
          }
        });
      } catch {}
    });

    // Places search
    if (searchInputRef.current && window.google.maps.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        { fields: ["geometry", "formatted_address", "name"], types: ["geocode"] }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formatted = place.formatted_address || place.name || "";

        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });

        dispatch(setMapLocation({ lat, long: lng }));
        dispatch(setMapAddress(formatted));
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, []);

  // When store location changes externally, keep map/marker synced
  useEffect(() => {
    if (!gmapRef.current || !markerRef.current) return;
    const { lat, long } = location;
    if (lat == null || long == null) return;
    const pos = { lat, lng: long };
    gmapRef.current.setCenter(pos);
    gmapRef.current.setZoom(15);
    markerRef.current.setPosition(pos);
  }, [location]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation || !gmapRef.current || !markerRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Move map and marker
        const map = gmapRef.current;
        const marker = markerRef.current;
        const center = { lat, lng };
        map.setCenter(center);
        map.setZoom(15);
        marker.setPosition(center);

        // Dispatch location
        dispatch(setMapLocation({ lat, long: lng }));

        // Reverse geocode for address
        try {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: center }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const formatted = results[0].formatted_address;
              dispatch(setMapAddress(formatted));
            }
            setLocating(false);
          });
        } catch {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-orange-700 mb-6">Checkout</h2>

        {/* Delivery Location */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="text-orange-600">📍</span> Delivery Location
          </h3>
          {/* Search + current location */}
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for address or place"
            className="w-full mb-3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={address || ""}
            onChange={(e) => {
              dispatch(setMapAddress(e.target.value));
            }}
          />
          <div className="flex justify-end mb-3">
            <Button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="bg-orange-100 text-orange-700 hover:bg-orange-200"
              variant="outline"
              size="sm"
            >
              {locating ? "Locating..." : "Use my current location"}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-3">{address}</p>
          <div
            ref={mapRef}
            className="h-56 w-full rounded-lg overflow-hidden border shadow"
          />
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Payment Method
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card
              className={`p-4 border-2 cursor-pointer ${
                paymentMethod === "cod"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <p className="font-medium text-gray-800">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when your food arrives</p>
            </Card>
            <Card
              className={`p-4 border-2 cursor-pointer ${
                paymentMethod === "online"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <p className="font-medium text-gray-800">
                UPI / Credit / Debit Card
              </p>
              <p className="text-sm text-gray-500">Pay securely online</p>
            </Card>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Order Summary
          </h3>
          <div className="bg-orange-50/40 rounded-xl border p-4 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id || item.itemId}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-gray-600 text-sm pt-2 border-t">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-orange-700 text-lg pt-2 border-t">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="mt-6">
          <Button onClick={handlePlaceOrder} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg transition">
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
