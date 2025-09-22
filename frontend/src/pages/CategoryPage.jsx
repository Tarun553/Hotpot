
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft } from "lucide-react";
import useCart from "../hooks/useCart";
import { Input } from "../components/ui/input";
import { toast } from "react-hot-toast";
import apiClient from "../utils/axios";


const CategoryPage = () => {
  const { addItemToCart } = useCart();
  const { category } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, Number(value)),
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = quantities[item._id] || 1;
    addItemToCart({
      itemId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      shop: item.shop?.name || "Shop",
      quantity,
      foodType: item.foodType,
    });
    // toast.success(`${item.name} (${quantity}) added to cart!`, {
    //   style: {
    //     background: '#fff7ed',
    //     color: '#ea580c',
    //     border: '1px solid #fdba74',
    //     fontWeight: 'bold',
    //   },
    //   iconTheme: {
    //     primary: '#ea580c',
    //     secondary: '#fff7ed',
    //   },
    // });
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/items/category/${category}`);
        setItems(response.data.items || []);
      } catch (error) {
        setError("Error fetching items. Please try again later.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [category]);
// if (!category || error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
//         <h1 className="text-3xl font-extrabold text-orange-700">Category not found</h1>
//       </div>
//     );
//   }
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10 px-4 animate-fadein">
      {/* Back to Home Button */}
      <div className="mb-6 flex items-center">
        <Button
          variant=""
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg font-semibold shadow-sm"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Home
        </Button>
      </div>
      <h1 className="text-3xl font-extrabold text-orange-700 capitalize mb-8 text-center tracking-tight animate-slidein">{category} Items</h1>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold mt-8">{error}</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
          {items.map((item, idx) => (
            <Card
              key={item._id}
              className="p-0 border border-orange-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white/90 animate-fadein"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-44 object-cover rounded-t-2xl mb-0 scale-100 group-hover:scale-105 transition-transform duration-300"
              />
              <CardContent className="flex flex-col items-start p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h4>
                <Badge className={`capitalize mb-2 ${item.foodType === "veg" ? "bg-green-500" : "bg-red-500"}`}>{item.foodType}</Badge>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600 font-bold text-lg">₹{item.price}</span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 mb-2">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm text-gray-600">
                    {item.rating?.average || 0} ({item.rating?.count || 0})
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">Shop: {item.shop?.name}</div>
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
      ) : (
        <p className="mt-8 text-center text-sm text-gray-500 italic animate-fadein">No items found in this category.</p>
      )}
      {/* Tailwind CSS animations */}
      <style>{`
        .animate-fadein { animation: fadein 0.7s ease; }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }
        .animate-slidein { animation: slidein 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes slidein { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default CategoryPage;
