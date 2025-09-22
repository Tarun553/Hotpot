import React from "react";
import { Truck, MapPin } from "lucide-react";
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
import { serverUrl } from "../utils/constants";
import { setUserData } from "@/redux/userSlice";

const DeliveryBoyNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

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
    <nav className="fixed top-0 w-full bg-orange-50 border-b border-orange-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100">
            <Truck className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-orange-600">
            Hotpot <span className="text-orange-600">Delivery</span>
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Location Indicator */}
          <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            <MapPin className="h-4 w-4" />
            <span>Location Active</span>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold shadow hover:bg-orange-700 transition">
                {initial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md">
              <DropdownMenuLabel className="font-semibold text-gray-900">
                {fullName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-gray-700 hover:bg-blue-50"
                onClick={() => navigate("/delivery-setup")}
              >
                Profile Setup
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 cursor-pointer hover:bg-red-50"
                onClick={handleLogout}
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default DeliveryBoyNavbar;
