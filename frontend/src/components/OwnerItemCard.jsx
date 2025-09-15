import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaPen, FaTrash } from "react-icons/fa";

const OwnerItemCard = ({ data, onEdit, onDelete }) => {
    console.log(data);
  return (
    <Card className="w-full max-w-xl border border-orange-300 rounded-xl shadow-sm mx-auto" style={{ marginTop: 24 }}>
      <CardContent className="flex flex-row items-center p-4 gap-0">
        {/* Item Image */}
        <img
          src={
            data.image ||
            "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80"
          }
          alt={data.name}
          className="w-36 h-24 object-cover rounded-l-xl"
        />
        {/* Item Info */}
        <div className="flex-1 px-6 py-2">
          <h3 className="font-bold text-lg text-orange-600 mb-1">{data.name}</h3>
          <p className="text-base font-bold text-gray-800 mb-1">
            Category: <span className="font-normal">{data.category}</span>
          </p>
          <p className="text-base font-bold text-gray-800 mb-1">
            Food Type: <span className="font-normal">{data.foodType}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerItemCard;
