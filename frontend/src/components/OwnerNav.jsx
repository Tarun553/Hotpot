import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "@/redux/userSlice";

const OwnerNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, shopOrders } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);

  // Extract user name + initial
  const fullName = userData?.fullName || "Guest User";
  const initial = fullName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/logout`, {}, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="w-full bg-orange-50 py-3 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Logo / App Name */}
      <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-orange-600 whitespace-nowrap">
        Hotpot🔥
      </span>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Add Food Item (only if shop exists) */}
        {myShopData && (
          <>
            {/* Mobile: Icon only */}
            <Button
              onClick={() => navigate("/create-item")}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-2 md:hidden"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
            {/* Desktop: Full Button */}
            <Button
              onClick={() => navigate("/create-item")}
              className="hidden md:inline bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-3 py-1 text-sm md:text-base"
            >
              + Add Food Item
            </Button>
          </>
        )}

        {/* Orders */}
        <div
          onClick={() => navigate("/my-orders")}
          className="flex items-center gap-1 md:gap-2 cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="text-orange-600 w-5 h-5 md:w-6 md:h-6" />
            {shopOrders.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-orange-600 text-white px-1.5 py-0.5 rounded-full">
                {shopOrders.length}
              </span>
            )}
          </div>
          <span className="hidden md:inline text-sm font-medium text-orange-600">
            My Orders
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
            <DropdownMenuItem
              className="text-red-500 cursor-pointer"
              onClick={handleLogout}
            >
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default OwnerNavbar;
