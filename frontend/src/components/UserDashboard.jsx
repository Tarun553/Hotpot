import React from "react";
import Navbar from "./Navbar";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";

const UserDashboard = ({ userData }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="text-center mb-12">
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
      </div>
    </div>
  );
};

export default UserDashboard;
