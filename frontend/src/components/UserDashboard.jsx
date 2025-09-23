import React from "react";
import Navbar from "./Navbar";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { useSelector } from "react-redux";
import ShopCard from "./ShopCard";
import useGetShopByCity from "../hooks/useGetShopByCity";
import FoodCard from "./FoodCard";
import { Component } from "./backed-by-yc";
const UserDashboard = ({ userData }) => {
  const { city } = useSelector((state) => state.user);
  const shops = useSelector((state) => state.shop.shops);
  useGetShopByCity();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <Component />
          <h1 className="text-3xl sm:text-4xl font-bold text-orange-700 font-heading">
            Welcome, {userData.fullName}
          </h1>
          <p className="text-gray-700 mt-2 text-lg">
            Browse through our delicious food categories 🍴
          </p>
        </div>

        {/* Categories */}
        <div className="w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Food Categories
          </h2>
          <div
            id="category-scroll"
            className="flex overflow-x-auto gap-6 pb-4 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat, idx) => (
              <CategoryCard
                key={idx}
                category={cat.category}
                image={cat.image}
              />
            ))}
          </div>

          {/* Hide Scrollbar */}
          <style>{`
            #category-scroll::-webkit-scrollbar { display: none; }
          `}</style>
        </div>
        {/* near shop section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Nearby Shops {city ? `in ${city}` : ""}
          </h2>
          <div className="w-full">
            <div
              id="shop-scroll"
              className="flex overflow-x-auto gap-6 pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {shops && shops.length > 0 ? (
                shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)
              ) : (
                <p className="text-gray-500 text-center">
                  No shops found in your city.
                </p>
              )}
            </div>

            {/* Hide scrollbar */}
            <style>{`
    #shop-scroll::-webkit-scrollbar { display: none; }
  `}</style>
          </div>
        </div>
        {/* suggested food items */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Suggested Food Items
          </h2>
          <div className="w-full">
            <div
              id="food-scroll"
              className="flex overflow-x-auto gap-6 pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Use FoodCard component for each item */}
              {shops && shops.length > 0 ? (
                shops.map((shop) =>
                  shop.items && shop.items.length > 0
                    ? shop.items.map((item) => (
                        <FoodCard key={item._id} item={item} shop={shop} />
                      ))
                    : null
                )
              ) : (
                <p className="text-gray-500 text-center">
                  No suggested food items available.
                </p>
              )}
            </div>

            {/* Hide scrollbar */}
            <style>{`
              #food-scroll::-webkit-scrollbar { display: none; }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
