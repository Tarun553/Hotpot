import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import Home from "./pages/Home";
import UserCart from "./pages/UserCart";
import Checkout from "./pages/Checkout";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import EditItemOwner from "./pages/EditItemOwner";
import AddFoodItem from "./pages/AddFoodItem";
import useGetAllShops from "./hooks/useGetAllShops";
import useGetShopByCity from "./hooks/useGetShopByCity";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useShopOrders from "./hooks/useShopOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import DeliveryBoyDashboard from "./pages/DeliveryBoyDashboard";
import DeliveryBoySetup from "./pages/DeliveryBoySetup";
import ParticularShop from "./components/ParticularShop";
// Access the server URL from environment variables
export const serverUrl = import.meta.env.VITE_SERVER_URL;

const App = () => {
  const user = useSelector((state) => state.user.userData);

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetAllShops();
  useGetShopByCity();
  useGetMyOrders();
  useShopOrders();
  useUpdateLocation();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/create-shop" element={user ? <CreateEditShop /> : <Navigate to="/login" />} />
        <Route path="/create-item" element={user ? <AddFoodItem /> : <Navigate to="/login" />} />
        <Route path="/edit-item/:id" element={user ? <EditItemOwner /> : <Navigate to="/login" />} />
        <Route path="/cart" element={user ? <UserCart /> : <Navigate to="/login" />} />
        <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
        <Route path="/order-placed" element={user ? <OrderPlaced /> : <Navigate to="/login" />} />
        {/* my order  route */}
        <Route path="/my-orders" element={user ? <MyOrders /> : <Navigate to="/login" />} />
        {/* track order route */}
        <Route path="/track-order/:orderId" element={user ? <TrackOrder /> : <Navigate to="/login" />} />
        {/* delivery boy routes */}
        <Route path="/delivery-dashboard" element={user?.role === 'deliveryBoy' ? <DeliveryBoyDashboard /> : <Navigate to="/login" />} />
        <Route path="/delivery-setup" element={user?.role === 'deliveryBoy' ? <DeliveryBoySetup /> : <Navigate to="/login" />} />
        <Route path="/shop/:id" element={user ? <ParticularShop /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
