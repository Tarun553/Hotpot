import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { serverUrl } from "../App";

const DEFAULT_POSITION = { lat: 28.6139, lng: 77.2090 }; // fallback to Delhi

const TrackOrder = () => {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBUWhyzmspBpNj7WOl5y6n2660kkLsOxU8"
  });

  useEffect(() => {
    let interval;
    const fetchTracking = async () => {
      try {
        setLoading(true);
        console.log(`Fetching tracking for order: ${orderId}`);
        console.log(`API URL: ${serverUrl}/api/orders/${orderId}/tracking`);
        
        const res = await fetch(`${serverUrl}/api/orders/${orderId}/tracking`, {
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`Response status: ${res.status}`);
        console.log(`Response headers:`, Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          // Check if response is HTML (404 page) vs JSON error
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Server error: ${res.status}`);
          } else {
            throw new Error(`API endpoint not found: ${res.status} - Make sure backend server is running`);
          }
        }
        
        const data = await res.json();
        console.log('Tracking data received:', data);
        setTracking(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Tracking fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    interval = setInterval(fetchTracking, 10000); // poll every 10s
    
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Tracking Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Tracking Available</h3>
          <p className="text-yellow-600">Tracking information is not yet available for this order.</p>
        </div>
      </div>
    );
  }

  const deliveryPos = tracking.deliveryBoy?.location?.coordinates?.length === 2
    ? { lat: tracking.deliveryBoy.location.coordinates[1], lng: tracking.deliveryBoy.location.coordinates[0] }
    : DEFAULT_POSITION;

  const deliveryAddress = tracking.deliveryAddress;
  const addressPos = deliveryAddress?.latitude && deliveryAddress?.longitude
    ? { lat: deliveryAddress.latitude, lng: deliveryAddress.longitude }
    : null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'on the way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Track Your Order</h1>
        
        {/* Order Status */}
        <div className="flex items-center gap-4 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tracking.status)}`}>
            {tracking.status || 'Unknown'}
          </span>
          {tracking.assignmentStatus && (
            <span className="text-sm text-gray-600">
              Assignment: {tracking.assignmentStatus}
            </span>
          )}
        </div>

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Delivery Address:</h3>
            <p className="text-gray-600">{deliveryAddress.text}</p>
          </div>
        )}

        {/* Shop Info */}
        {tracking.shop && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Restaurant:</h3>
            <p className="text-gray-600">{tracking.shop.name}</p>
            {tracking.shop.address && <p className="text-sm text-gray-500">{tracking.shop.address}</p>}
          </div>
        )}

        {/* Delivery Boy Info */}
        {tracking.deliveryBoy && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Delivery Partner</h3>
            <p className="text-blue-700 font-medium">{tracking.deliveryBoy.name}</p>
            {tracking.deliveryBoy.mobile && (
              <p className="text-blue-600 text-sm">📞 {tracking.deliveryBoy.mobile}</p>
            )}
            {!tracking.deliveryBoy.location && (
              <p className="text-yellow-600 text-sm mt-2">📍 Location not available yet</p>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Location</h2>
        {isLoaded ? (
          <GoogleMap
            center={deliveryPos}
            zoom={tracking.deliveryBoy?.location ? 15 : 12}
            mapContainerStyle={{ height: "500px", width: "100%" }}
            options={{
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {/* Delivery Boy Marker */}
            {tracking.deliveryBoy?.location && (
              <Marker
                position={deliveryPos}
                icon={{
                  url: '/scooter.png',
                  scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : undefined
                }}
                onClick={() => setShowDeliveryInfo(true)}
              >
                {showDeliveryInfo && (
                  <InfoWindow onCloseClick={() => setShowDeliveryInfo(false)}>
                    <div className="p-2">
                      <h4 className="font-semibold">{tracking.deliveryBoy.name}</h4>
                      <p className="text-sm text-gray-600">Delivery Partner</p>
                      {tracking.deliveryBoy.mobile && (
                        <p className="text-sm">📞 {tracking.deliveryBoy.mobile}</p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            )}

            {/* Delivery Address Marker */}
            {addressPos && (
              <Marker
                position={addressPos}
                icon={{
                  url: '/home.png',
                  scaledSize: isLoaded ? new window.google.maps.Size(35, 35) : undefined
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Loading map...</p>
          </div>
        )}
      </div>

      {/* Status History */}
      {tracking.statusHistory && tracking.statusHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Timeline</h2>
          <div className="space-y-3">
            {tracking.statusHistory.map((status, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status).replace('text-', 'bg-').replace('100', '500')}`}></div>
                <div>
                  <span className="font-medium capitalize">{status.status}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {new Date(status.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-center mt-6 text-sm text-gray-500">
        <p>📡 Auto-refreshing every 10 seconds</p>
        <p className="text-xs">Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default TrackOrder;
