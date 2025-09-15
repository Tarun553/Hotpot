import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import EditItemOwner from "./pages/EditItemOwner";
import AddFoodItem from "./pages/AddFoodItem";
// Access the server URL from environment variables
export const serverUrl = import.meta.env.VITE_SERVER_URL;

const App = () => {
  const user = useSelector((state) => state.user.userData);

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();

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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
