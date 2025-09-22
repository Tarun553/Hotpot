import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, User, Phone, FileText, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { serverUrl } from '../utils/constants';
import { setUserData } from '../redux/userSlice';
import DeliveryBoyNavbar from '../components/DeliveryBoyNavbar';

const DeliveryBoySetup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    phone: userData?.mobile || '',
    emergencyContact: '',
    workingHours: 'full-time',
    experience: '',
    profileImage: null
  });
  
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('checking');
  const [currentLocation, setCurrentLocation] = useState(null);

  // Get current location on component mount
  React.useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('not-supported');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLocationStatus('success');
        toast.success('Location captured successfully!');
      },
      (error) => {
        setLocationStatus('error');
        console.error('Geolocation error:', error);
        toast.error('Failed to get location. Please enable location access.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentLocation) {
      toast.error('Please enable location access to continue');
      return;
    }

    if (!formData.vehicleType || !formData.vehicleNumber || !formData.licenseNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'profileImage' && formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add profile image if selected
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }
      
      // Add location data
      submitData.append('latitude', currentLocation.latitude);
      submitData.append('longitude', currentLocation.longitude);

      // Submit delivery boy profile
      const response = await axios.post(
        `${serverUrl}/api/user/delivery-boy-setup`,
        submitData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update user data in Redux
      dispatch(setUserData(response.data.user));
      
      toast.success('Profile setup completed successfully!');
      navigate('/delivery-dashboard');
      
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error(error.response?.data?.message || 'Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  const getLocationStatusColor = () => {
    switch (locationStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'success': return 'Location captured ✓';
      case 'error': return 'Location failed ✗';
      case 'loading': return 'Getting location...';
      case 'not-supported': return 'Location not supported';
      default: return 'Checking location...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DeliveryBoyNavbar />
      
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center bg-orange-50">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Truck className="h-8 w-8 text-orange-600" />
                <CardTitle className="text-2xl font-bold text-orange-900">
                  Complete Your Delivery Profile
                </CardTitle>
              </div>
              <p className="text-gray-600">
                Set up your delivery boy profile to start receiving orders within 5km radius
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Location Status</span>
                    </div>
                    <div className={`font-medium ${getLocationStatusColor()}`}>
                      {getLocationStatusText()}
                    </div>
                  </div>
                  {locationStatus === 'error' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="mt-2"
                    >
                      Retry Location
                    </Button>
                  )}
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Vehicle Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type *</Label>
                      <Select value={formData.vehicleType} onValueChange={(value) => handleSelectChange('vehicleType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bike">Motorcycle/Bike</SelectItem>
                          <SelectItem value="scooter">Scooter</SelectItem>
                          <SelectItem value="bicycle">Bicycle</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                      <Input
                        id="vehicleNumber"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., MH12AB1234"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Driving License Number *</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder="Enter driving license number"
                      required
                    />
                  </div>
                </div>

                {/* Work Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Work Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workingHours">Working Hours</Label>
                      <Select value={formData.workingHours} onValueChange={(value) => handleSelectChange('workingHours', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select working hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time (8+ hours)</SelectItem>
                          <SelectItem value="part-time">Part Time (4-8 hours)</SelectItem>
                          <SelectItem value="flexible">Flexible Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Delivery Experience</Label>
                      <Select value={formData.experience} onValueChange={(value) => handleSelectChange('experience', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresher">Fresher (No experience)</SelectItem>
                          <SelectItem value="1-year">Less than 1 year</SelectItem>
                          <SelectItem value="1-3-years">1-3 years</SelectItem>
                          <SelectItem value="3-plus-years">3+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Profile Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Profile Photo</span>
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Upload Profile Picture</Label>
                    <Input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {formData.profileImage && (
                      <p className="text-sm text-green-600">
                        ✓ Image selected: {formData.profileImage.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={loading || locationStatus !== 'success'}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Setting up profile...
                      </>
                    ) : (
                      'Complete Setup & Start Delivering'
                    )}
                  </Button>
                  
                  {locationStatus !== 'success' && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Location access is required to receive delivery assignments within 5km
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoySetup;
