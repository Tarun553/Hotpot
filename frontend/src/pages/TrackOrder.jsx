import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow, Polyline } from "@react-google-maps/api";
import { serverUrl } from "../App";

const DEFAULT_POSITION = { lat: 28.6139, lng: 77.2090 }; // fallback to Delhi

const TrackOrder = () => {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const fetchTracking = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(true);
      

      
      const res = await fetch(`${serverUrl}/api/orders/${orderId}/tracking`, {
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Response status: ${res.status}`);
      
      if (!res.ok) {
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
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error("Tracking fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch only
  useEffect(() => {
    fetchTracking();
  }, [orderId]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchTracking(false); // Don't show full loading for refresh
  };



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

  // Fix: Correct coordinate extraction - ensure proper lat/lng order
  const deliveryPos = tracking.deliveryBoy?.location?.coordinates?.length === 2
    ? { 
        lat: parseFloat(tracking.deliveryBoy.location.coordinates[1]), // latitude is index 1
        lng: parseFloat(tracking.deliveryBoy.location.coordinates[0])  // longitude is index 0
      }
    : DEFAULT_POSITION;

  const deliveryAddress = tracking.deliveryAddress;
  const addressPos = deliveryAddress?.latitude && deliveryAddress?.longitude
    ? { 
        lat: parseFloat(deliveryAddress.latitude), 
        lng: parseFloat(deliveryAddress.longitude) 
      }
    : null;

  // Create polyline path between delivery boy and delivery address
  const polylinePath = (tracking.deliveryBoy?.location && addressPos) 
    ? [deliveryPos, addressPos] 
    : [];

  // Calculate estimated distance (Haversine formula)
  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2 || !pos1.lat || !pos1.lng || !pos2.lat || !pos2.lng) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const distance = calculateDistance(deliveryPos, addressPos);

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

  // Get map center based on available data
  const mapCenter = addressPos || deliveryPos || DEFAULT_POSITION;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header with Refresh Button */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Track Your Order</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                refreshing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg 
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh Location'}
            </button>
            
            {/* OTP Verification Button - Only show for certain statuses */}
            {tracking.status === 'on the way' && (
              <button
                onClick={() => setShowOtpModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Verify Delivery
              </button>
            )}
          </div>
        </div>
        
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
          {distance && (
            <span className="text-sm text-blue-600 font-medium">
              📍 Distance: {distance} km
            </span>
          )}
        </div>

        {/* Delivery OTP Display */}
        {tracking.deliveryOtp && tracking.status !== 'delivered' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">🔒 Delivery OTP</h3>
            <div className="text-2xl font-bold text-green-700 tracking-widest">
              {tracking.deliveryOtp}
            </div>
            <p className="text-sm text-green-600 mt-1">
              Share this OTP with the delivery partner to complete your order
            </p>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-sm text-gray-500 mb-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Delivery Address:</h3>
            <p className="text-gray-600">{deliveryAddress.text}</p>
            <p className="text-sm text-gray-500">
              📍 {deliveryAddress.latitude?.toFixed(6)}, {deliveryAddress.longitude?.toFixed(6)}
            </p>
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
              <a 
                href={`tel:${tracking.deliveryBoy.mobile}`}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1 mt-1"
              >
                📞 {tracking.deliveryBoy.mobile}
              </a>
            )}
            {tracking.deliveryBoy.location ? (
              <p className="text-green-600 text-sm mt-2">
                📍 Live location: {deliveryPos.lat.toFixed(6)}, {deliveryPos.lng.toFixed(6)}
              </p>
            ) : (
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
            center={mapCenter}
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
            {/* Polyline connecting delivery boy and delivery address */}
            {polylinePath.length === 2 && (
              <Polyline
                path={polylinePath}
                options={{
                  strokeColor: "#FF6B35",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            )}

            {/* Delivery Boy Marker */}
            {tracking.deliveryBoy?.location && deliveryPos.lat && deliveryPos.lng && (
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
                      {distance && (
                        <p className="text-sm text-blue-600 font-medium">
                          📍 {distance} km away
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {deliveryPos.lat.toFixed(4)}, {deliveryPos.lng.toFixed(4)}
                      </p>
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
                title="Delivery Address"
              />
            )}
          </GoogleMap>
        ) : (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Loading map...</p>
          </div>
        )}

        {/* Map Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <img src="/scooter.png" alt="Delivery" className="w-5 h-5" />
            <span>Delivery Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/home.png" alt="Home" className="w-5 h-5" />
            <span>Your Location</span>
          </div>
          {polylinePath.length === 2 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-orange-500 rounded"></div>
              <span>Route ({distance} km)</span>
            </div>
          )}
        </div>
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

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4 mt-6 text-center">
        <p className="text-blue-700 text-sm">
          💡 <strong>Tip:</strong> Click "Refresh Location" to get the latest delivery partner location
          {tracking.deliveryOtp && (
            <><br/>🔒 <strong>Keep your OTP secure</strong> and only share it with the delivery partner upon arrival</>
          )}
        </p>
      </div>
    </div>
  );
};

export default TrackOrder;
