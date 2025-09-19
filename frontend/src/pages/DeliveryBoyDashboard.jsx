import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import useDeliveryBoy from '../hooks/useDeliveryBoy';
import DeliveryBoyNavbar from '../components/DeliveryBoyNavbar';
import { MapPin, Clock, Package, DollarSign, Phone, User, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const handleAcceptDelivery = async (assignmentId) => {
    setProcessingId(assignmentId);
    const success = await acceptDelivery(assignmentId);
    setProcessingId(null);
  };

  const handleCompleteDelivery = async (assignmentId) => {
    setProcessingId(assignmentId);
    const success = await completeDelivery(assignmentId);
    setProcessingId(null);
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    return address?.text || 'Address not provided';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <DeliveryBoyNavbar />
      
      <div className="pt-16 p-4">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
            <p className="text-gray-600">Manage your delivery assignments</p>
          </div>
          <Button onClick={refreshData} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{availableDeliveries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{myDeliveries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">
              Available Deliveries ({availableDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              My Deliveries ({myDeliveries.length})
            </TabsTrigger>
          </TabsList>

          {/* Available Deliveries Tab */}
          <TabsContent value="available" className="space-y-4">
            {loading && availableDeliveries.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading available deliveries...</p>
              </div>
            ) : availableDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries available</h3>
                  <p className="text-gray-600">Check back later for new delivery opportunities within 5km!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {availableDeliveries.map((delivery) => (
                  <Card key={delivery._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{delivery.shop?.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Order #{delivery.order?._id?.slice(-6)}
                          </p>
                        </div>
                        <Badge variant="secondary">Within 5km</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Customer Info */}
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{delivery.order?.user?.fullName}</span>
                          <Phone className="h-4 w-4 text-gray-500 ml-4" />
                          <span className="text-sm">{delivery.order?.user?.mobile}</span>
                        </div>

                        {/* Delivery Address */}
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{formatAddress(delivery.order?.deliveryAddress)}</p>
                            {delivery.order?.deliveryAddress?.latitude && 
                             delivery.order?.deliveryAddress?.longitude && (
                              <p className="text-xs text-gray-500">
                                Distance: ~{calculateDistance(
                                  0, 0, // You'll need to get delivery boy's current location
                                  delivery.order.deliveryAddress.latitude,
                                  delivery.order.deliveryAddress.longitude
                                )}km away
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Shop Address */}
                        <div className="flex items-start space-x-2">
                          <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">Pickup: {delivery.shop?.address}</p>
                            <p className="text-xs text-gray-500">Shop: {delivery.shop?.phone}</p>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">₹{delivery.order?.totalAmount}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatTime(delivery.assignedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Accept Button */}
                        <Button
                          onClick={() => handleAcceptDelivery(delivery._id)}
                          disabled={processingId === delivery._id}
                          className="w-full"
                        >
                          {processingId === delivery._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Accepting...
                            </>
                          ) : (
                            'Accept Delivery'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Deliveries Tab */}
          <TabsContent value="assigned" className="space-y-4">
            {myDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active deliveries</h3>
                  <p className="text-gray-600">Accept deliveries from the available tab to see them here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myDeliveries.map((delivery) => (
                  <Card key={delivery._id} className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{delivery.shop?.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Order #{delivery.order?._id?.slice(-6)}
                          </p>
                        </div>
                        <Badge variant="default">Assigned</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Customer Info */}
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{delivery.order?.user?.fullName}</span>
                          <Phone className="h-4 w-4 text-gray-500 ml-4" />
                          <span className="text-sm">{delivery.order?.user?.mobile}</span>
                        </div>

                        {/* Delivery Address */}
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Delivery Address:</p>
                            <p className="text-sm">{formatAddress(delivery.order?.deliveryAddress)}</p>
                          </div>
                        </div>

                        {/* Shop Address */}
                        <div className="flex items-start space-x-2">
                          <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Pickup Address:</p>
                            <p className="text-sm">{delivery.shop?.address}</p>
                            <p className="text-xs text-gray-500">Shop: {delivery.shop?.phone}</p>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">₹{delivery.order?.totalAmount}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Accepted: {formatTime(delivery.assignedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleCompleteDelivery(delivery._id)}
                            disabled={processingId === delivery._id}
                            className="flex-1"
                          >
                            {processingId === delivery._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Completing...
                              </>
                            ) : (
                              'Mark as Delivered'
                            )}
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
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;