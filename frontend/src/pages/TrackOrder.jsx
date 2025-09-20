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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fetchTracking = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(true);

      const res = await fetch(`${serverUrl}/api/orders/${orderId}/tracking`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

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

  useEffect(() => {
    fetchTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleRefresh = () => fetchTracking(false);

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

  const polylinePath = (tracking.deliveryBoy?.location && addressPos)
    ? [deliveryPos, addressPos]
    : [];

  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2 || !pos1.lat || !pos1.lng || !pos2.lat || !pos2.lng) return null;
    const R = 6371;
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

  const mapCenter = addressPos || deliveryPos || DEFAULT_POSITION;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">Track your order</h1>
              <p className="text-sm text-gray-500">Real-time location and delivery details</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-shadow ${
                  refreshing ? 'bg-gray-100 text-gray-500 shadow-none' : 'bg-orange-600 text-white shadow-md hover:shadow-lg'
                }`}
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582" />
                </svg>
                {refreshing ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="p-4">
            {isLoaded ? (
              <GoogleMap
                center={mapCenter}
                zoom={tracking.deliveryBoy?.location ? 15 : 12}
                mapContainerStyle={{ height: '560px', width: '100%' }}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {polylinePath.length === 2 && (
                  <Polyline
                    path={polylinePath}
                    options={{ strokeColor: '#FF6B35', strokeWeight: 4, geodesic: true }}
                  />
                )}

                {tracking.deliveryBoy?.location && deliveryPos.lat && deliveryPos.lng && (
                  <Marker
                    position={deliveryPos}
                    icon={{ url: '/scooter.png', scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : undefined }}
                    onClick={() => setShowDeliveryInfo(true)}
                  >
                    {showDeliveryInfo && (
                      <InfoWindow onCloseClick={() => setShowDeliveryInfo(false)}>
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-900">{tracking.deliveryBoy.name}</h4>
                          <p className="text-sm text-gray-600">Delivery Partner</p>
                          {tracking.deliveryBoy.mobile && <p className="text-sm">📞 {tracking.deliveryBoy.mobile}</p>}
                          {distance && <p className="text-sm text-blue-600 font-medium">📍 {distance} km away</p>}
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                )}

                {addressPos && (
                  <Marker position={addressPos} icon={{ url: '/home.png', scaledSize: isLoaded ? new window.google.maps.Size(35, 35) : undefined }} title="Delivery Address" />
                )}
              </GoogleMap>
            ) : (
              <div className="h-96 flex items-center justify-center">Loading map...</div>
            )}
          </div>
        </div>

        {/* Right: Info Panel */}
        <aside className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Delivery Details</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tracking.status)}`}>{tracking.status || 'Unknown'}</span>
          </div>

          {/* OTP */}
          {tracking.deliveryOtp && tracking.status !== 'delivered' && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4 text-center">
              <div className="text-xs text-green-600">Delivery OTP</div>
              <div className="text-3xl font-bold text-green-800 tracking-widest mt-1">{tracking.deliveryOtp}</div>
              <p className="text-xs text-green-600 mt-1">Share this with the delivery partner</p>
            </div>
          )}

          {/* Shop */}
          {tracking.shop && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Restaurant</h4>
              <p className="text-gray-800 font-medium">{tracking.shop.name}</p>
              {tracking.shop.address && <p className="text-xs text-gray-500 mt-1">{tracking.shop.address}</p>}
            </div>
          )}

          {/* Address */}
          {deliveryAddress && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Delivery Address</h4>
              <p className="text-gray-800">{deliveryAddress.text}</p>
              <p className="text-xs text-gray-500 mt-1">{deliveryAddress.latitude?.toFixed(6)}, {deliveryAddress.longitude?.toFixed(6)}</p>
            </div>
          )}

          {/* Delivery partner */}
          {tracking.deliveryBoy ? (
            <div className="mb-4 border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700">Delivery Partner</h4>
              <p className="text-gray-800 font-medium">{tracking.deliveryBoy.name}</p>
              {tracking.deliveryBoy.mobile && <a href={`tel:${tracking.deliveryBoy.mobile}`} className="text-xs text-blue-600 block mt-1">📞 {tracking.deliveryBoy.mobile}</a>}
              {tracking.deliveryBoy.location ? (
                <p className="text-xs text-gray-500 mt-2">Live: {deliveryPos.lat.toFixed(4)}, {deliveryPos.lng.toFixed(4)}</p>
              ) : (
                <p className="text-xs text-yellow-600 mt-2">Location not available yet</p>
              )}
            </div>
          ) : (
            <div className="mb-4">No delivery partner assigned yet</div>
          )}

          {/* Distance & timeline quick stats */}
          <div className="mt-4">
            {distance && <div className="text-sm text-gray-700">Estimated distance: <span className="font-medium">{distance} km</span></div>}
            {lastUpdated && <div className="text-xs text-gray-400 mt-2">Last updated: {lastUpdated.toLocaleTimeString()}</div>}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={handleRefresh} className="w-full bg-orange-600 text-white py-2 rounded-md shadow-sm hover:opacity-95">Refresh Location</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full border border-gray-200 py-2 rounded-md">Back to top</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TrackOrder;
