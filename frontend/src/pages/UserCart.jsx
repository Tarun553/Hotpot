import React from "react";
import { Button } from "@/components/ui/button";
import useCart from "../hooks/useCart";
import { Link } from "react-router-dom";

const UserCart = () => {
  const {
    cartItems,
    addItemToCart,
    removeItemFromCart,
    updateItemInCart,
    getCartByUser,
  } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-orange-700 mb-8 text-center font-heading">
          🛒 My Cart
        </h2>

        {/* Empty cart */}
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-20 text-lg">
            Your cart is empty.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            {cartItems.map((item) => (
              <div
                key={item.id || item.itemId}
                className="flex items-center gap-5 bg-orange-50/40 rounded-xl p-4 border border-orange-100 hover:shadow-md transition"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />

                {/* Item Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {item.shop}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                      item.foodType === "veg"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.foodType === "veg" ? "Veg" : "Non-Veg"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-orange-600 font-bold text-lg">
                    ₹{item.price}
                  </span>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-600 rounded-full px-2"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateItemInCart(item.itemId, item.quantity - 1);
                        } else {
                          removeItemFromCart(item.itemId);
                        }
                      }}
                    >
                      −
                    </Button>
                    <span className="text-base font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-600 rounded-full px-2"
                      onClick={() =>
                        updateItemInCart(item.itemId || item.id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>

                  <span className="text-gray-500 text-xs">
                    Total: ₹{item.price * item.quantity}
                  </span>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1 text-xs"
                    onClick={() => removeItemFromCart(item.itemId || item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {/* Cart Summary */}
            <div className="flex justify-between items-center pt-6 border-t">
              <span className="text-xl font-bold text-orange-700">
                Total Price
              </span>
              <span className="text-2xl font-extrabold text-orange-600">
                ₹{totalPrice}
              </span>
            </div>

            {/* Checkout */}
            <div className="flex justify-end pt-4">
                <Link to="/checkout">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition">
                    Checkout
                  </Button>
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCart;
