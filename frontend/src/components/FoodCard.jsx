import React from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import useCart from "../hooks/useCart";

const FoodCard = ({ item, shop }) => {
  const { addItemToCart, getCartByUser } = useCart();
  const dispatch = useDispatch();
  
  
  
  // Function to render star ratings
  const renderStars = (rating, count) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="text-yellow-400 text-sm" />
      );
    }
    if (halfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className="text-yellow-400 text-sm" />
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-${i}`} className="text-orange-400 text-sm" />
      );
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-xs text-orange-500">
          {rating > 0 ? rating.toFixed(1) : "0.0"}
        </span>
        {count > 0 && (
          <span className="text-xs text-orange-400">({count})</span>
        )}
      </div>
    );
  };

  // Quantity state
  const [quantity, setQuantity] = React.useState(0);

  return (
    <div className="flex-shrink-0 w-56 rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg">
      {/* Item Image */}
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-32 object-cover transition-transform duration-500 hover:scale-110"
        />

        {/* Veg / Non-Veg Badge */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium shadow ${
            item.foodType === "veg"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {item.foodType === "veg" ? "Veg" : "Non-Veg"}
        </span>
      </div>

      {/* Item Details */}
      <div className="p-3 flex flex-col h-full">
        <h3 className="text-base font-semibold text-gray-800 line-clamp-1 mb-1">
          {item.name}
        </h3>

        {/* Rating */}
        {renderStars(item.rating?.average || 0, item.rating?.count || 0)}

        {/* Price */}
        <p className="text-sm font-bold text-orange-600 mt-2">
          ₹{item.price}
        </p>

        {/* Quantity & Add to Cart */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border rounded-full px-2 py-1 gap-2 bg-gray-50">
            <button
              className="text-orange-600 text-lg font-bold px-1 focus:outline-none"
              onClick={() => setQuantity((q) => Math.max(0, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-base font-semibold w-5 text-center">
              {quantity}
            </span>
            <button
              className="text-orange-600 text-lg font-bold px-1 focus:outline-none"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className="ml-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 flex items-center justify-center shadow"
            aria-label="Add to cart"
            onClick={() => {
              if (quantity > 0) {
                addItemToCart({
                  itemId: item._id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  shop: shop.name || "Shop",
                  quantity,
                  foodType: item.foodType,
                });
                setQuantity(0); // Optionally reset quantity after adding
              }
            }}
          >
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6h15l-1.5 9h-13z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
