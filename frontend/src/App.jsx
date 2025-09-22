import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import OfflineIndicator from "./components/OfflineIndicator";
import AppInitializer from "./components/AppInitializer";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetAllShops from "./hooks/useGetAllShops";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useShopOrders from "./hooks/useShopOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";

// Lazy load components for code splitting
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ForgotPassword = React.lazy(() => import("./pages/ForgetPassword"));
const Home = React.lazy(() => import("./pages/Home"));
const UserCart = React.lazy(() => import("./pages/UserCart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const CreateEditShop = React.lazy(() => import("./pages/CreateEditShop"));
const EditItemOwner = React.lazy(() => import("./pages/EditItemOwner"));
const AddFoodItem = React.lazy(() => import("./pages/AddFoodItem"));
const OrderPlaced = React.lazy(() => import("./pages/OrderPlaced"));
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const TrackOrder = React.lazy(() => import("./pages/TrackOrder"));
const DeliveryBoyDashboard = React.lazy(() => import("./pages/DeliveryBoyDashboard"));
const DeliveryBoySetup = React.lazy(() => import("./pages/DeliveryBoySetup"));
const ParticularShop = React.lazy(() => import("./components/ParticularShop"));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Access the server URL from environment variables
export const serverUrl = import.meta.env.VITE_SERVER_URL;

const App = () => {
  // Initialize hooks
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetAllShops();
  useGetShopByCity();
  useGetMyOrders();
  useShopOrders();
  useUpdateLocation();

  return (
    <ErrorBoundary>
      <AppInitializer>
        <OfflineIndicator />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <ForgotPassword />
                </ProtectedRoute>
              } 
            />

            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <UserCart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-placed" 
              element={
                <ProtectedRoute>
                  <OrderPlaced />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-orders" 
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/track-order/:orderId" 
              element={
                <ProtectedRoute>
                  <TrackOrder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop/:id" 
              element={
                <ProtectedRoute>
                  <ParticularShop />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/category/:category" 
              element={
                <ProtectedRoute>
                  <CategoryPage />
                </ProtectedRoute>
              } 
            />

            {/* Owner routes */}
            <Route 
              path="/create-shop" 
              element={
                <ProtectedRoute allowedRoles="owner">
                  <CreateEditShop />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-item" 
              element={
                <ProtectedRoute allowedRoles="owner">
                  <AddFoodItem />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-item/:id" 
              element={
                <ProtectedRoute allowedRoles="owner">
                  <EditItemOwner />
                </ProtectedRoute>
              } 
            />

            {/* Delivery boy routes */}
            <Route 
              path="/delivery-dashboard" 
              element={
                <ProtectedRoute allowedRoles="deliveryBoy">
                  <DeliveryBoyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/delivery-setup" 
              element={
                <ProtectedRoute allowedRoles="deliveryBoy">
                  <DeliveryBoySetup />
                </ProtectedRoute>
              } 
            />

            {/* 404 and catch-all routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </AppInitializer>
    </ErrorBoundary>
  );
};

export default App;
