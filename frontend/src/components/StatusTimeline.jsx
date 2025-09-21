import React from "react";
import { CheckCircle, Clock, Package, Truck, MapPin, XCircle } from "lucide-react";

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    label: "Order Pending"
  },
  accepted: {
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    label: "Order Accepted"
  },
  preparing: {
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    label: "Being Prepared"
  },
  "on the way": {
    icon: Truck,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
    label: "On the Way"
  },
  delivered: {
    icon: MapPin,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    label: "Delivered"
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    label: "Cancelled"
  }
};

const allStatuses = ["pending", "accepted", "preparing", "on the way", "delivered"];

const StatusTimeline = ({ currentStatus, statusHistory = [], isCancelled = false }) => {
  const getStatusIndex = (status) => allStatuses.indexOf(status);
  const currentIndex = getStatusIndex(currentStatus);

  const getStatusState = (status, index) => {
    if (isCancelled && status === "cancelled") return "current";
    if (isCancelled) return "disabled";
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  const getTimeForStatus = (status) => {
    const historyItem = statusHistory.find(h => h.status === status);
    return historyItem ? new Date(historyItem.updatedAt).toLocaleString() : null;
  };

  const renderStatusNode = (status, index) => {
    const config = statusConfig[status];
    const state = getStatusState(status, index);
    const Icon = config.icon;
    const time = getTimeForStatus(status);

    return (
      <div key={status} className="flex items-center group">
        {/* Timeline line */}
        {index > 0 && (
          <div className={`absolute left-6 w-0.5 h-8 -mt-8 ${
            state === "completed" || (index <= currentIndex && !isCancelled)
              ? "bg-gradient-to-b from-green-400 to-green-600" 
              : "bg-gray-200"
          }`} />
        )}
        
        {/* Status Node */}
        <div className="relative flex items-center">
          <div className={`
            relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
            ${state === "completed" 
              ? "bg-green-500 border-green-500 text-white shadow-lg" 
              : state === "current"
                ? `${config.bgColor} ${config.borderColor} ${config.color} animate-pulse shadow-md`
                : state === "disabled"
                  ? "bg-gray-100 border-gray-300 text-gray-400"
                  : "bg-white border-gray-300 text-gray-400"
            }
          `}>
            {state === "completed" ? (
              <CheckCircle size={20} className="text-white" />
            ) : (
              <Icon size={20} />
            )}
          </div>
          
          {/* Status Label and Time */}
          <div className="ml-4 flex-1">
            <div className={`font-medium text-sm ${
              state === "completed" ? "text-green-700" 
              : state === "current" ? config.color
              : state === "disabled" ? "text-gray-400"
              : "text-gray-500"
            }`}>
              {config.label}
            </div>
            {time && (
              <div className="text-xs text-gray-500 mt-1">
                {time}
              </div>
            )}
            {state === "current" && !time && (
              <div className="text-xs text-orange-600 mt-1 animate-pulse">
                In progress...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle cancelled orders
  if (isCancelled) {
    const cancelledTime = getTimeForStatus("cancelled");
    return (
      <div className="space-y-6 p-4 bg-red-50/50 rounded-xl border border-red-100">
        <div className="text-center mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            Order Cancelled
          </div>
        </div>
        
        {/* Show completed statuses before cancellation */}
        <div className="space-y-6 relative">
          {allStatuses.slice(0, currentIndex + 1).map((status, index) => 
            renderStatusNode(status, index)
          )}
          
          {/* Cancelled status */}
          <div className="flex items-center">
            <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 bg-red-500 border-red-500 text-white shadow-lg">
              <XCircle size={20} />
            </div>
            <div className="ml-4 flex-1">
              <div className="font-medium text-sm text-red-700">
                Order Cancelled
              </div>
              {cancelledTime && (
                <div className="text-xs text-gray-500 mt-1">
                  {cancelledTime}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 rounded-xl border border-orange-100">
      <div className="text-center mb-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
          Order Progress
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-400 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((currentIndex + 1) / allStatuses.length) * 100}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          {Math.round(((currentIndex + 1) / allStatuses.length) * 100)}% Complete
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6 relative">
        {allStatuses.map((status, index) => renderStatusNode(status, index))}
      </div>
    </div>
  );
};

export default StatusTimeline;