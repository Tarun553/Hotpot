import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const ShopCard = ({ shop }) => {
  return (
    <Card className="w-[220px] rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-32 object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {shop.name}
        </div>
      </div>

      <CardContent className="p-3 space-y-1">
        <h2 className="text-base font-bold text-red-600">{shop.name}</h2>
        <p className="text-xs text-gray-700">{shop.address}</p>
        <p className="text-xs text-gray-600">
          {shop.city}, {shop.state}
        </p>
        <p className="text-xs text-gray-500">
          Owner: {shop.owner?.fullName || "Unknown"}
        </p>
      </CardContent>
    </Card>
  );
};

export default ShopCard;
