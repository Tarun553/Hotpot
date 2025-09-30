import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // ✅ hamburger drawer
import { useSelector, useDispatch } from "react-redux";
import apiClient from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "@/redux/userSlice";
import toast from "react-hot-toast";


const Navbar = () => {
  const searchInputRef = useRef();
  const { cartItems, userData, city } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // cart count
  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // profile initials
  const fullName = userData?.fullName || "Guest User";
  const initial = fullName.charAt(0).toUpperCase();

  // search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({ shops: [], items: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // debounce search
  React.useEffect(() => {
    if (searchTerm.length > 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const timeout = setTimeout(async () => {
        try {
          const response = await apiClient.get(
            `/api/user/search?q=${encodeURIComponent(searchTerm.trim())}`
          );
          setSearchResults(response.data);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults({ shops: [], items: [] });
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setSearchResults({ shops: [], items: [] });
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      dispatch(clearUserData());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      dispatch(clearUserData());
      navigate("/login");
    }
  };

  return (
    <nav className="w-full bg-orange-50 py-4 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* App Name */}
      <span className="text-xl md:text-2xl font-extrabold text-orange-600 whitespace-nowrap">
       🍲 Hotpot 
      </span>

      {/* Search (hidden on mobile) */}
      <form
        className="hidden sm:flex items-center w-full max-w-2xl bg-white rounded-xl shadow-md px-4 md:px-6 py-2 mx-4 relative"
        onSubmit={handleSearch}
        autoComplete="off"
      >
        {/* Location */}
        <div className="flex items-center gap-2 text-orange-600 font-medium mr-4 md:mr-6">
          <FaMapMarkerAlt className="text-lg" />
          <span className="truncate">{city || "Detecting..."}</span>
        </div>

        {/* Search input */}
        <div className="flex items-center flex-1 relative">
          <FiSearch className="text-gray-400 text-xl mr-2 cursor-pointer" />
          <Input
            type="text"
            placeholder="Search delicious food..."
            className="border-none shadow-none focus:ring-0 text-sm md:text-base bg-transparent px-0"
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {/* Results Dropdown */}
          {showDropdown &&
            (searchResults.shops.length > 0 ||
              searchResults.items.length > 0) && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white border border-orange-200 rounded-xl shadow-lg z-50 max-h-96 overflow-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-orange-500">
                    Searching...
                  </div>
                ) : (
                  <>
                    {searchResults.shops.length > 0 && (
                      <div className="px-4 py-2 text-xs font-bold text-orange-600">
                        Shops
                      </div>
                    )}
                    {searchResults.shops.map((shop) => (
                      <div
                        key={shop._id}
                        className="px-4 py-2 cursor-pointer hover:bg-orange-50 flex items-center gap-2"
                        onMouseDown={() => navigate(`/shop/${shop._id}`)}
                      >
                        <span className="font-semibold text-orange-700">
                          {shop.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {shop.city}
                        </span>
                      </div>
                    ))}
                    {searchResults.items.length > 0 && (
                      <div className="px-4 py-2 text-xs font-bold text-orange-600">
                        Items
                      </div>
                    )}
                    {searchResults.items.map((item) => (
                      <div
                        key={item._id}
                        className="px-4 py-2 cursor-pointer hover:bg-orange-50 flex items-center gap-2"
                        onMouseDown={() =>
                          navigate(`/shop/${item.shop?._id || item.shop}`)
                        }
                      >
                        <span className="font-semibold text-gray-800">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.category}
                        </span>
                        <span className="text-xs text-orange-600">
                          {item.shop?.name}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
        </div>
      </form>

      {/* Desktop Right Section */}
      <div className="hidden md:flex items-center gap-4 md:gap-6">
        {/* Cart + My Orders */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Button
            onClick={() => navigate("/chat")}
            className="bg-transparent hover:bg-orange-100 mr-2"
            title="AI Assistant"
          >
            <span className="text-orange-600 text-lg">🤖</span>
          </Button>
          <Button
            onClick={() => navigate("/cart")}
            className="bg-transparent hover:bg-orange-100"
          >
            <ShoppingCart className="text-orange-600 w-6 h-6" />
          </Button>
          <span
            onClick={() => navigate("/my-orders")}
            className="text-sm font-medium text-orange-600 cursor-pointer"
          >
            My Orders
          </span>
          <span className="ml-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
            {totalQuantity} items
          </span>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold">
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

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="p-2 rounded-md text-orange-600 hover:bg-orange-100"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle className="text-orange-600 font-bold">
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              <Button
                onClick={() => navigate("/chat")}
                className="w-full justify-start bg-orange-50 text-orange-700 hover:bg-orange-100"
              >
                🤖 AI Assistant
              </Button>
              <Button
                onClick={() => navigate("/cart")}
                className="w-full justify-start bg-orange-50 text-orange-700 hover:bg-orange-100"
              >
                🛒 Cart ({totalQuantity})
              </Button>
              <Button
                onClick={() => navigate("/my-orders")}
                className="w-full justify-start bg-orange-50 text-orange-700 hover:bg-orange-100"
              >
                📦 My Orders
              </Button>
              <Button
                onClick={handleLogout}
                className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100"
              >
                🚪 Log Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
