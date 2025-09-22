import React, { useState, useRef } from "react";
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
import apiClient from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "@/redux/userSlice";
import toast from "react-hot-toast";


const Navbar = () => {


  const searchInputRef = useRef();
  const { cartItems } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, city } = useSelector((state) => state.user);
  // Calculate total quantity
  const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Extract user name + initial
  const fullName = userData?.fullName || "Guest User";
  const initial = fullName.charAt(0).toUpperCase();

  // Instant search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({ shops: [], items: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced instant search
  React.useEffect(() => {
    if (searchTerm.length > 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const timeout = setTimeout(async () => {
        try {
          const response = await apiClient.get(`/api/user/search?q=${encodeURIComponent(searchTerm.trim())}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Search error:', error);
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

  // Handle search submit (Enter)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Focus input on icon click
  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    setShowDropdown(true);
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      dispatch(clearUserData());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      // Clear local state anyway as backup
      dispatch(clearUserData());
      navigate("/login");
    }
  };

  return (
    <nav className="w-full bg-orange-50 py-4 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* App Name */}
      <span className="text-xl md:text-2xl font-extrabold text-orange-600 whitespace-nowrap">
        Hotpot🔥
      </span>

      {/* Search + Location */}
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

        {/* Search Bar */}
        <div className="flex items-center flex-1 relative">
          <FiSearch
            className="text-gray-400 text-xl mr-2 cursor-pointer"
            onClick={handleSearchIconClick}
          />
          <Input
            type="text"
            placeholder="Search delicious food..."
            className="border-none shadow-none focus:ring-0 text-sm md:text-base bg-transparent px-0"
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e);
              }
            }}
          />
          {/* Results Dropdown */}
          {showDropdown && (searchResults.shops.length > 0 || searchResults.items.length > 0) && (
            <div className="absolute left-0 top-full mt-2 w-full bg-white border border-orange-200 rounded-xl shadow-lg z-50 max-h-96 overflow-auto animate-fadein">
              {isSearching ? (
                <div className="p-4 text-center text-orange-500">Searching...</div>
              ) : (
                <>
                  {searchResults.shops.length > 0 && (
                    <div className="px-4 py-2 text-xs font-bold text-orange-600">Shops</div>
                  )}
                  {searchResults.shops.map((shop) => (
                    <div
                      key={shop._id}
                      className="px-4 py-2 cursor-pointer hover:bg-orange-50 flex items-center gap-2"
                      onMouseDown={() => navigate(`/shop/${shop._id}`)}
                    >
                      <span className="font-semibold text-orange-700">{shop.name}</span>
                      <span className="text-xs text-gray-500">{shop.city}</span>
                    </div>
                  ))}
                  {searchResults.items.length > 0 && (
                    <div className="px-4 py-2 text-xs font-bold text-orange-600">Items</div>
                  )}
                  {searchResults.items.map((item) => (
                    <div
                      key={item._id}
                      className="px-4 py-2 cursor-pointer hover:bg-orange-50 flex items-center gap-2"
                      onMouseDown={() => navigate(`/shop/${item.shop?._id || item.shop}`)}
                    >
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.category}</span>
                      <span className="text-xs text-orange-600">{item.shop?.name}</span>
                    </div>
                  ))}
                  {(searchResults.shops.length === 0 && searchResults.items.length === 0) && (
                    <div className="p-4 text-center text-gray-400">No results found.</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </form>
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
