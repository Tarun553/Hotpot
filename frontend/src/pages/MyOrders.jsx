import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { setOrderStatus } from "../redux/userSlice";
import StatusTimeline from "../components/StatusTimeline";
import apiClient from "../utils/axios";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  "on the way": "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const orderStatuses = [
  "pending",
  "accepted",
  "preparing",
  "on the way",
  "delivered",
  "cancelled",
];

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myOrders = [], shopOrders = [], userData } = useSelector(
    (state) => state.user
  );
  const [loadingStatus, setLoadingStatus] = useState({});

  const updateOrderStatus = async (orderId, shopId, newStatus) => {
    const statusKey = `${orderId}-${shopId}`;
    setLoadingStatus((prev) => ({ ...prev, [statusKey]: true }));
    try {
      // Use the correct API endpoint with orderId and shopId
      const response = await apiClient.put(
        `/api/orders/${orderId}/${shopId}/status`,
        { status: newStatus }
      );
      
      // Show success message with delivery assignment info if status is "preparing"
      if (newStatus === "preparing" && response.data.deliveryAssignmentAttempted) {
        toast.success("✅ Order status updated & delivery boys notified within 5km!");
      } else if (newStatus === "preparing") {
        toast.success("✅ Order status updated (No delivery boys found within 5km)");
      } else {
        toast.success("✅ Order status updated");
      }
      
      dispatch(setOrderStatus(response.data));
      // Force refresh shop orders to get updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("❌ Failed to update status");
    } finally {
      setLoadingStatus((prev) => ({ ...prev, [statusKey]: false }));
    }
  };

  const renderOrderCard = (order, role) => (
    <Card
      key={order._id}
      className="border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white"
    >
      <CardHeader className="flex flex-row justify-between items-center border-b pb-2">
        <CardTitle className="text-lg font-semibold text-orange-700">
          Order #{order._id.slice(-6)}
        </CardTitle>
        {role === "user" && (
          <div className="flex flex-wrap gap-2">
            {order.shopOrder?.map((shopOrder, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[shopOrder.status || "pending"]}`}
              >
                {shopOrder.status || "pending"}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-gray-700 mt-2">
        <div className="flex justify-between">
          <span className="font-medium">Placed:</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>

        {role === "owner" && (
          <div className="flex justify-between">
            <span className="font-medium">Customer:</span>
            <span>{order.user?.email}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="font-medium">Total:</span>
          <span className="text-orange-600 font-semibold">
            ₹{order.totalAmount}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Payment:</span>
          <span className="capitalize">{order.paymentMethod}</span>
        </div>

        <div>
          <span className="font-medium">Delivery:</span>
          <p className="ml-1 text-gray-600">{order.deliveryAddress?.text}</p>
        </div>

        {role === "owner" ? (
          <div className="space-y-6 mt-4">
            {order.shopOrder?.map((shopOrder, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-orange-100 bg-orange-50/30 transition hover:bg-orange-50"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-orange-700">
                    Shop: {shopOrder.shop?.name}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[shopOrder.status || "pending"]}`}
                  >
                    {shopOrder.status || "pending"}
                  </span>
                </div>

                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Subtotal: </span>
                  <span className="text-orange-600">₹{shopOrder.subtotal}</span>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Items:</span>
                  <ul className="list-disc ml-5 mt-1">
                    {shopOrder.shopOrderItems?.map((item) => (
                      <li key={item._id}>
                        {item.item?.name} × {item.quantity}{" "}
                        <span className="text-orange-600">
                          ₹{item.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Timeline for Owners */}
                <div className="mt-4">
                  <StatusTimeline 
                    currentStatus={shopOrder.status || "pending"}
                    statusHistory={shopOrder.statusHistory || []}
                    isCancelled={shopOrder.status === "cancelled"}
                  />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Select
                    value={shopOrder.status || "pending"}
                    onValueChange={(newStatus) =>
                      updateOrderStatus(order._id, shopOrder.shop?._id, newStatus)
                    }
                    disabled={loadingStatus[`${order._id}-${shopOrder.shop?._id}`]}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {loadingStatus[`${order._id}-${shopOrder.shop?._id}`] && (
                    <span className="text-sm text-orange-600 animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            {/* Status Timeline for Users */}
            {order.shopOrder && order.shopOrder.length > 0 && (
              <div className="mb-4">
                <StatusTimeline 
                  currentStatus={order.shopOrder[0].status || "pending"}
                  statusHistory={order.shopOrder[0].statusHistory || []}
                  isCancelled={order.shopOrder[0].status === "cancelled"}
                />
              </div>
            )}
            
            <div className="mt-3">
              <span className="font-medium">Items:</span>
              <ul className="list-disc ml-5 mt-1">
                {order.shopOrder?.flatMap((shopOrder) =>
                  shopOrder.shopOrderItems?.map((item) => (
                    <li key={item._id}>
                      {item.item?.name} × {item.quantity}{" "}
                      <span className="text-orange-600">
                        ₹{item.price * item.quantity}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Track Order Button for Users */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => navigate(`/track-order/${order._id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                disabled={!order.shopOrder.some(so => ['preparing', 'on the way'].includes(so.status))}
              >
                📍 Track Order
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-orange-700 mb-8 text-center">
          My Orders
        </h2>

        {userData?.role === "user" ? (
          myOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-12 animate-pulse">
              No orders found.
            </div>
          ) : (
            <div className="grid gap-6">
              {myOrders.map((order) => renderOrderCard(order, "user"))}
            </div>
          )
        ) : userData?.role === "owner" ? (
          shopOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-12 animate-pulse">
              No shop orders found.
            </div>
          ) : (
            <div className="grid gap-6">
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
