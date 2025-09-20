import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import useDeliveryBoy from '../hooks/useDeliveryBoy';
import DeliveryBoyNavbar from '../components/DeliveryBoyNavbar';
import { MapPin, Clock, Package, DollarSign, Phone, User, Truck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { serverUrl } from '../App';

const DeliveryBoyDashboard = () => {
  const {
    availableDeliveries,
    myDeliveries,
    loading,
    acceptDelivery,
    completeDelivery,
    refreshData
  } = useDeliveryBoy();

  const [processingId, setProcessingId] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDeliveryData, setOtpDeliveryData] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAcceptDelivery = async (assignmentId) => {
    setProcessingId(assignmentId);
    await acceptDelivery(assignmentId);
    setProcessingId(null);
  };

  const handleCompleteDelivery = async (assignmentId, customerName) => {
    setOtpDeliveryData({ assignmentId, customerName });
    setShowOtpModal(true);
    setOtp('');
    setOtpError('');
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 4) {
      setOtpError('Please enter a valid 4-digit OTP');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Call the backend API to verify OTP and complete delivery
      const response = await fetch(`${serverUrl}/api/delivery/complete/${otpDeliveryData.assignmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ otp })
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowOtpModal(false);
        setOtp('');
        setOtpError('');
        setOtpDeliveryData(null);
        toast.success('🎉 Delivery completed successfully!');
        refreshData(); // Refresh the delivery data
      } else {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to verify OTP. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setOtpError('');
    setOtpDeliveryData(null);
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    return address?.text || 'Address not provided';
  };

  const formatTime = (date) => new Date(date).toLocaleString();

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Navbar */}
      <DeliveryBoyNavbar />

      <div className="pt-20 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-orange-700">Delivery Dashboard</h1>
              <p className="text-gray-600">Track, accept, and complete your orders</p>
            </div>
            <Button
              onClick={refreshData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm hover:shadow-md transition rounded-xl">
              <CardContent className="p-5 flex items-center">
                <Package className="h-10 w-10 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Available Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{availableDeliveries.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition rounded-xl">
              <CardContent className="p-5 flex items-center">
                <Truck className="h-10 w-10 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{myDeliveries.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition rounded-xl">
              <CardContent className="p-5 flex items-center">
                <DollarSign className="h-10 w-10 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹0</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="available" className="space-y-4">
            <TabsList className="w-full grid grid-cols-2 rounded-lg bg-white shadow-sm">
              <TabsTrigger value="available">
                Available ({availableDeliveries.length})
              </TabsTrigger>
              <TabsTrigger value="assigned">
                My Deliveries ({myDeliveries.length})
              </TabsTrigger>
            </TabsList>

            {/* Available Deliveries */}
            <TabsContent value="available" className="space-y-4">
              {loading && availableDeliveries.length === 0 ? (
                <div className="text-center py-10">
                  <div className="animate-spin h-10 w-10 border-2 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Fetching new deliveries...</p>
                </div>
              ) : availableDeliveries.length === 0 ? (
                <Card className="text-center py-10">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">No deliveries right now</h3>
                  <p className="text-gray-500">Check back soon for new opportunities near you</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {availableDeliveries.map((delivery) => (
                    <Card key={delivery._id} className="rounded-xl shadow-sm hover:shadow-md transition">
                      <CardHeader className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold text-orange-700">{delivery.shop?.name}</CardTitle>
                          <p className="text-sm text-gray-500">Order #{delivery.order?._id?.slice(-6)}</p>
                        </div>
                        <Badge variant="secondary">Nearby</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          {delivery.order?.user?.fullName}
                          <Phone className="w-4 h-4 text-gray-500 ml-3" />
                          {delivery.order?.user?.mobile}
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p>{formatAddress(delivery.order?.deliveryAddress)}</p>
                            {delivery.order?.deliveryAddress?.latitude &&
                             delivery.order?.deliveryAddress?.longitude && (
                              <p className="text-xs text-gray-500">
                                ~{calculateDistance(delivery.order.deliveryAddress.latitude,delivery.order.deliveryAddress.longitude)} km away
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1 font-medium">
                            <DollarSign className="w-4 h-4 text-gray-500" /> ₹{delivery.order?.totalAmount}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" /> {formatTime(delivery.assignedAt)}
                          </span>
                        </div>

                        <Button
                          onClick={() => handleAcceptDelivery(delivery._id)}
                          disabled={processingId === delivery._id}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          {processingId === delivery._id ? "Accepting..." : "Accept Delivery"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Deliveries */}
            <TabsContent value="assigned" className="space-y-4">
              {myDeliveries.length === 0 ? (
                <Card className="text-center py-10">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">No active deliveries</h3>
                  <p className="text-gray-500">Accept a delivery to start working</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {myDeliveries.map((delivery) => (
                    <Card key={delivery._id} className="border-l-4 border-orange-500 bg-orange-50 rounded-xl">
                      <CardHeader className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold text-orange-700">{delivery.shop?.name}</CardTitle>
                          <p className="text-sm text-gray-500">Order #{delivery.order?._id?.slice(-6)}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700" variant="default">Assigned</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" /> {delivery.order?.user?.fullName}
                          <Phone className="w-4 h-4 text-gray-500 ml-3" /> {delivery.order?.user?.mobile}
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1 font-medium">
                            <DollarSign className="w-4 h-4 text-gray-500" /> ₹{delivery.order?.totalAmount}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" /> Accepted: {formatTime(delivery.assignedAt)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCompleteDelivery(delivery._id, delivery.order?.user?.fullName)}
                            disabled={processingId === delivery._id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingId === delivery._id ? "Completing..." : "Mark as Delivered"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const phoneNumber = delivery.order?.user?.mobile;
                              if (phoneNumber) {
                                window.open(`tel:${phoneNumber}`, '_self');
                              } else {
                                toast.error('Phone number not available');
                              }
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* OTP Verification Modal */}
          {showOtpModal && otpDeliveryData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    🔒 Verify Delivery
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ask the customer <strong>"{otpDeliveryData.customerName}"</strong> for their 4-digit delivery OTP
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                      Enter OTP provided by customer:
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      pattern="[0-9]{4}"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setOtp(value);
                        setOtpError('');
                      }}
                      className="w-full px-4 py-4 text-center text-3xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 tracking-[0.5em] bg-gray-50"
                      placeholder="0000"
                      autoFocus
                      disabled={isVerifying}
                    />
                    {otpError && (
                      <p className="text-red-600 text-sm mt-3 text-center">{otpError}</p>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <p className="text-yellow-800 text-sm text-center">
                      ⚠️ <strong>Important:</strong> Only complete delivery after confirming you have handed over the order to <strong>{otpDeliveryData.customerName}</strong>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeOtpModal}
                      disabled={isVerifying}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={otp.length !== 4 || isVerifying}
                      className={`flex-1 ${
                        otp.length === 4 && !isVerifying
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        'Complete Delivery'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-yellow-800 text-sm text-center">
              🔒 <strong>Important:</strong> Always ask customers for their 4-digit OTP before marking orders as delivered. 
              This ensures secure delivery verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;
