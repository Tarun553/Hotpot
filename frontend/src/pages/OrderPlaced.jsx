import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const OrderPlaced = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get order details from navigation state
    const orderDetails = location.state?.orderDetails;
    const orderId = location.state?.orderId || orderDetails?.id || orderDetails?._id;
    
    // Debug logs
    console.log("🔍 OrderPlaced component state:", location.state);
    console.log("📋 Order details:", orderDetails);
    console.log("🆔 Order ID:", orderId);
    
    // If no order data is available, redirect to home
    React.useEffect(() => {
        if (!location.state || (!orderId && !orderDetails)) {
            console.warn("⚠️ No order data found, redirecting to my-orders");
            // Instead of redirecting immediately, show a message and redirect after a delay
            setTimeout(() => {
                navigate("/my-orders", { replace: true });
            }, 2000);
        }
    }, [location.state, orderId, orderDetails, navigate]);
    
    // If no order data, show a fallback message
    if (!location.state || (!orderId && !orderDetails)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center max-w-md">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Order Placed Successfully! 🎉
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your order has been placed successfully. Redirecting you to your orders...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center max-w-md">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-in">
                    Order Placed Successfully 🎉
                </h1>
                <p className="text-gray-600 mb-6 animate-fade-in">
                    Thank you for shopping with us!  
                    Your order is on the way 🚚
                </p>
                
                {orderId && (
                    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 w-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Order ID:</span>
                            <span className="text-sm font-mono text-gray-800">{orderId}</span>
                        </div>
                        {orderDetails?.paymentMethod && (
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Payment:</span>
                                <span className="text-sm text-gray-800 capitalize">
                                    {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : orderDetails.paymentMethod}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-center mt-3 text-orange-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">Processing your order...</span>
                        </div>
                    </div>
                )}

                <div className="space-y-3 w-full">
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-md transition-transform transform hover:scale-105 w-full"
                        onClick={() => navigate("/my-orders")}
                    >
                        <Package className="h-4 w-4 mr-2" />
                        View My Orders
                    </Button>
                    
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/")}
                    >
                        Continue Shopping
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderPlaced;
