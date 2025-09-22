
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../utils/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Mail, Phone, Star, ArrowBigLeft } from "lucide-react";
import useCart from "../hooks/useCart";

const ParticularShop = () => {
  const { addItemToCart } = useCart();
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/shop/${id}`, {
          withCredentials: true,
        });
        setShop(response.data.shop);
        setError(null);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("Shop not found or invalid shop ID.");
        } else if (error.response && error.response.status === 400) {
          setError("Invalid shop ID.");
        } else {
          setError("Error fetching shop. Please try again later.");
        }
        setShop(null);
      }
    };
    fetchShop();
  }, [id]);

  // Handle quantity change for each item
  const handleQuantityChange = (itemId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [itemId]: qty }));
  };

  // Add to cart with quantity
  const handleAddToCart = (item) => {
    const quantity = quantities[item._id] || 1;
    addItemToCart({
      itemId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      shop: shop.name || "Shop",
      quantity,
      foodType: item.foodType,
    });
  };

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10 text-lg font-semibold">
        {error}
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="animate-pulse text-gray-500">Loading shop details...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-orange-50 to-orange-100 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* back to shop page revert button */}
        <Button variant="" className="mb-4 bg-orange-400 hover:bg-orange-500 text-white" onClick={() => window.history.back()}>
          <ArrowBigLeft size={16} /> Home
        </Button>
        {/* Shop Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-end p-6">
            <h1 className="text-white text-4xl font-bold capitalize drop-shadow-lg">
              {shop.name}
            </h1>
          </div>
        </div>

        {/* Shop Info */}
        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <Card className="col-span-2 p-8 bg-white/80 shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-orange-600">About Shop</h2>
            <p className="text-gray-700 mb-2 text-lg">{shop.address}</p>
            <p className="flex items-center gap-2 text-gray-600 text-base">
              <MapPin size={18} className="text-orange-500" />
              {shop.city}, {shop.state}
            </p>
          </Card>

          {/* Owner Card */}
          <Card className="p-8 bg-white/80 shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-orange-600">Owner Details</h2>
            <p className="font-semibold capitalize text-lg">{shop.owner.fullName}</p>
            <p className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Mail size={16} className="text-orange-500" />
              {shop.owner.email}
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Phone size={16} className="text-orange-500" />
              {shop.owner.mobile}
            </p>
          </Card>
        </div>

        {/* Items */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-8 text-center text-orange-700">Available Items</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {shop.items.map((item) => (
              <Card
                key={item._id}
                className="rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white/90"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-44 w-full object-cover"
                />
                <CardContent className="p-5">
                  <h3 className="font-bold text-xl mb-1 text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 capitalize mb-1">{item.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      className={`capitalize ${item.foodType === "veg" ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {item.foodType}
                    </Badge>
                    <span className="font-bold text-lg text-orange-600">₹{item.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-yellow-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm text-gray-600">
                      {item.rating?.average || 0} ({item.rating?.count || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Input
                      type="number"
                      min={1}
                      value={quantities[item._id] || 1}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      className="w-20 text-center border-gray-300 rounded-lg"
                    />
                    <Button
                      className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add {quantities[item._id] > 1 ? `(${quantities[item._id]})` : ''} to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticularShop;
