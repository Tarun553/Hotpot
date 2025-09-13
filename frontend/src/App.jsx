import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";

export const serverUrl = import.meta.env.VITE_SERVER_URL;

const App = () => {
 const { user, isLoading, error } = useGetCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  console.log("Current User:", user);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
