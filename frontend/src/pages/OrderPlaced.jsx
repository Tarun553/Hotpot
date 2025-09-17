import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
const OrderPlaced = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-in">
                    Order Placed Successfully 🎉
                </h1>
                <p className="text-gray-600 mb-6 animate-fade-in">
                    Thank you for shopping with us!  
                    Your order is on the way 🚚
                </p>
                <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-md transition-transform transform hover:scale-105"
                    onClick={() => navigate("/my-orders")}
                >
                    Back To My Orders
                </Button>
            </div>
        </div>
    );
};

export default OrderPlaced;
