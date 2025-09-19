import React from "react";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, RefreshCw } from "lucide-react";
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

const DeliveryBoyNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  // Extract user name + initial
  const fullName = userData?.fullName || "Delivery Boy";
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
    <nav className="w-full bg-blue-50 py-3 px-4 md:px-6 flex items-center justify-between shadow-sm fixed top-0 z-50">
      {/* Logo / App Name */}
      <div className="flex items-center space-x-2">
        <Truck className="h-6 w-6 text-blue-600" />
        <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-blue-600 whitespace-nowrap">
          Hotpot Delivery
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Location Status */}
        <div className="flex items-center space-x-1 text-blue-600">
          <MapPin className="h-4 w-4" />
          <span className="text-xs md:text-sm">Location Active</span>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {initial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
            <DropdownMenuLabel className="font-medium">
              {fullName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/delivery-setup")}
            >
              Profile Setup
            </DropdownMenuItem>
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

export default DeliveryBoyNavbar;