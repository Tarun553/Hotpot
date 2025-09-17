import React from "react";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const MyOrders = () => {
  const { myOrders = [], shopOrders = [], userData } = useSelector(
    (state) => state.user
  );

  const renderOrderCard = (order, role) => (
    <Card
      key={order._id}
      className="border rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
    >
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-lg text-orange-700">
          Order #{order._id.slice(-6)}
        </CardTitle>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            statusColors[order.status || "pending"]
          }`}
        >
          {order.status || "pending"}
        </span>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-gray-700">
        <div>Placed: {new Date(order.createdAt).toLocaleString()}</div>

        {role === "owner" && (
          <div>
            <span className="font-semibold">Customer: </span>
            {order.user?.email}
          </div>
        )}

        <div>
          <span className="font-semibold">Total: </span>
          <span className="text-orange-600 font-bold">
            ₹{order.totalAmount}
          </span>
        </div>

        <div>
          <span className="font-semibold">Delivery: </span>
          {order.deliveryAddress?.text}
        </div>

        <div>
          <span className="font-semibold">Payment: </span>
          {order.paymentMethod}
        </div>

        <div>
          <span className="font-semibold">Shops: </span>
          {order.shopOrder?.map((shopOrder) => shopOrder.shop?.name).join(", ")}
        </div>

        <div>
          <span className="font-semibold">Items:</span>
          <ul className="list-disc ml-6">
            {order.shopOrder?.flatMap((shopOrder) =>
              shopOrder.shopOrderItems?.map((item) => (
                <li key={item._id} className="text-gray-700">
                  {item.item?.name} × {item.quantity}{" "}
                  <span className="text-orange-600">
                    ₹{item.price * item.quantity}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {role === "owner" && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 transition"
              disabled
            >
              Change Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center font-heading">
          My Orders
        </h2>

        {userData?.role === "user" ? (
          myOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-12 animate-pulse">
              No orders found.
            </div>
          ) : (
            <div className="space-y-6">
              {myOrders.map((order) => renderOrderCard(order, "user"))}
            </div>
          )
        ) : userData?.role === "owner" ? (
          shopOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-12 animate-pulse">
              No shop orders found.
            </div>
          ) : (
            <div className="space-y-6">
              {shopOrders.map((order) => renderOrderCard(order, "owner"))}
            </div>
          )
        ) : (
          <div className="text-center text-gray-500 py-12">
            No orders to show.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
