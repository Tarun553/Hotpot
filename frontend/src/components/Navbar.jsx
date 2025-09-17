import React from "react";
import { Input } from "@/components/ui/input";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { setUserData } from "@/redux/userSlice";

import useCart from "../hooks/useCart";


const Navbar = () => {
  const {getCartByUser} = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, city } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.user);
  // Calculate total quantity
  const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
 
  // Extract user name + initial
  const fullName = userData?.fullName || "Guest User";
  const initial = fullName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/logout`, {}, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/login");
    } catch (err) {
      // Optionally show error toast
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="w-full bg-orange-50 py-4 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* App Name */}
      <span className="text-xl md:text-2xl font-extrabold text-orange-600 whitespace-nowrap">
        Hotpot🔥
      </span>

      {/* Search + Location */}
      <div className="hidden sm:flex items-center w-full max-w-2xl bg-white rounded-xl shadow-md px-4 md:px-6 py-2 mx-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-orange-600 font-medium mr-4 md:mr-6">
          <FaMapMarkerAlt className="text-lg" />
          <span className="truncate">{city || "Detecting..."}</span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center flex-1">
          <FiSearch className="text-gray-400 text-xl mr-2" />
          <Input
            type="text"
            placeholder="Search delicious food..."
            className="border-none shadow-none focus:ring-0 text-sm md:text-base bg-transparent px-0"
          />
        </div>
      </div>

      {/* Right Side (Cart + Profile) */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Cart */}
        <div className="flex items-center gap-1 md:gap-2 cursor-pointer">
          <Button onClick={() => navigate("/cart")} className="bg-transparent hover:bg-orange-100">
            <ShoppingCart className="text-orange-600 w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <span onClick={() => navigate("/my-orders")} className="hidden md:inline text-sm font-medium text-orange-600">
            My Orders
          </span>
          <span className="ml-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
            {totalQuantity} items
          </span>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold">
              {initial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
            <DropdownMenuLabel className="font-medium">
              {fullName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
