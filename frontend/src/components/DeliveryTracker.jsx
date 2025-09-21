import React from 'react';
import { Badge } from './ui/badge';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';

const DeliveryTracker = ({ delivery, isOwner = false }) => {
  if (!delivery || delivery.status === 'broadcasted') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Looking for delivery boys within 5km...
          </span>
        </div>
      </div>
    );
  }

  if (delivery.status === 'assigned') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Delivery Boy Assigned
            </span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            On the way
          </Badge>
        </div>
        
        {isOwner && (
          <div className="mt-2 text-xs text-green-600">
            Assigned at: {new Date(delivery.assignedAt).toLocaleString()}
          </div>
        )}
      </div>
    );
  }

  if (delivery.status === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            Delivery Completed!
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default DeliveryTracker;