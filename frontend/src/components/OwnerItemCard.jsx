import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaPen, FaTrash } from "react-icons/fa";
import { IndianRupee } from "lucide-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onEdit = (data) => {
    navigate(`/edit-item/${data._id}`);
  };

  const onDelete = async (data) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/items/delete-item/${data._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const result = await res.json();
      if (res.ok) {
        window.location.reload(); 
        // Or trigger a state update in parent
        dispatch(setMyShopData(result.shop));
      } else {
        alert(result.message || "Failed to delete item");
      }
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  return (
    <Card className="w-full max-w-sm border border-orange-300 rounded-xl shadow-md hover:shadow-lg transition-all">
      <CardContent className="p-4 flex flex-col gap-4">
        {/* Image */}
        <div className="w-full h-40 rounded-lg overflow-hidden">
          <img
            src={
              data.image ||
              "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80"
            }
            alt={data.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>

        {/* Item Info */}
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-lg text-orange-600">{data.name}</h3>
          <p className="text-sm text-gray-700">
            Category:{" "}
            <span className="font-semibold capitalize">{data.category}</span>
          </p>
          <p className="text-sm text-gray-700 flex items-center gap-2">
            Food Type:{" "}
            <Badge
              className={`capitalize flex items-center gap-1 px-2 py-0.5 text-xs font-semibold ${
                data.foodType === "veg"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {/* Dot */}
              <span
                className={`w-2 h-2 rounded-full ${
                  data.foodType === "veg" ? "bg-green-600" : "bg-red-600"
                }`}
              ></span>
              {data.foodType}
            </Badge>
          </p>
          <p className="text-base font-semibold flex items-center gap-1">
            <IndianRupee size={16} /> {data.price}
          </p>
          {/* <p className="text-xs text-gray-500">
            Added on {new Date(data.createdAt).toLocaleDateString()}
          </p> */}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-100"
            onClick={() => onEdit?.(data)}
          >
            <FaPen size={12} /> Edit
          </Button>
          <Button
            size="sm"
            variant=""
            className="flex items-center gap-2 bg-orange-600 text-white hover:bg-orange-700"
            onClick={() => onDelete?.(data)}
          >
            <FaTrash size={12} /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerItemCard;
