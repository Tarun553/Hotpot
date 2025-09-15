import React from "react";
import OwnerNavbar from "./OwnerNav";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import OwnerItemCard from "./OwnerItemCard";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100">
      {/* Navbar */}
      <OwnerNavbar />

      <div className="mt-16 px-2 sm:px-6 lg:px-8 flex flex-col items-center">
        {myShopData ? (
          <div className="flex flex-col items-center w-full gap-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <FaUtensils className="text-4xl text-orange-600" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center drop-shadow">
                Welcome to {myShopData.name}
              </h1>
            </div>

            {/* Shop Image + Info together */}
            <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-lg bg-white">
              <img
                src={
                  myShopData.image ||
                  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=80"
                }
                alt={myShopData.name || "Tarun Bakery"}
                className="w-full h-56 sm:h-72 object-cover block"
              />
              {/* Edit Button */}
              <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-orange-100 transition border border-orange-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-orange-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z"
                  />
                </svg>
              </button>
              {/* Shop Info under image */}
              <div className="bg-white p-5 border-t border-orange-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {myShopData.name || ""}
                </h2>
                <p className="text-gray-700 font-medium mb-1">
                  {myShopData.address || ""}
                </p>
                <p className="text-gray-600">
                  {myShopData.city && myShopData.state
                    ? `${myShopData.city}, ${myShopData.state}`
                    : "MP, India"}
                </p>
              </div>
            </div>

           
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[400px] w-full">
            <Card className="w-full max-w-md text-center p-8 border border-orange-200 shadow-md">
              <CardContent className="flex flex-col items-center">
                <FaUtensils className="text-6xl text-orange-600 mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Add Your Restaurant
                </h2>
                <p className="text-gray-600 mb-6">
                  Join our food delivery platform and reach thousands of hungry customers every day.
                </p>
                <Link to="/create-shop">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-semibold text-lg">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {myShopData?.items.length === 0 && (
        <div className="flex justify-center items-center mt-10">
          <Card className="w-full max-w-md text-center p-8 border border-orange-200 shadow-md">
            <CardContent>
              <h2 className="text-2xl font-bold mb-2">No Menu Items Found</h2>
              <p className="text-gray-600 mb-6">
                It looks like you haven't added any menu items yet.
              </p>
              <Link to="/create-item">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-semibold text-lg">
                  Add Menu Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
      {myShopData && myShopData.items?.length > 0 && (
        <div className="w-full max-w-4xl mt-10 px-2 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Menu Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myShopData.items.map((item, index) => (
              <OwnerItemCard key={index} data={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
