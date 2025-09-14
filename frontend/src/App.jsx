import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import Home from "./pages/Home";

// Access the server URL from environment variables
export const serverUrl = import.meta.env.VITE_SERVER_URL;

const App = () => {
  const user = useSelector((state) => state.user.userData);
 console.log(user)
  useGetCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
