import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../utils/constants';
import { setUserData } from '../redux/userSlice';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

const useUpdateLocation = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const watchIdRef = useRef(null);
  
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    // Only start watching if user is logged in and we don't already have a watch active
    if (!userData || watchIdRef.current !== null) {
      return;
    }

    const startWatching = () => {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Fixed: Correct API endpoint with /api prefix
            const response = await axios.put(`${serverUrl}/api/user/update-location`, {
              lat: latitude,  // Backend expects 'lat', not 'latitude'
              long: longitude, // Backend expects 'long', not 'longitude'
            }, {
              withCredentials: true, // Added credentials for authentication
            });
            
            console.log('Location updated:', response.data);
            
            // Don't update Redux state to avoid infinite loops
            // Location is primarily for delivery assignment, not user state
          } catch (error) {
            console.error('Location update error:', error);
            // Only show error toast if it's not a network/auth issue
            if (error.response?.status !== 401) {
              toast.error("Failed to update location");
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error('Location access denied by user');
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error('Location information unavailable');
              break;
            case error.TIMEOUT:
              toast.error('Location request timed out');
              break;
            default:
              toast.error('Unable to retrieve your location');
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache position for 1 minute
        }
      );
    };

    startWatching();

    // Cleanup function to clear the watch when component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [dispatch, userData?.email]); // Use userData.email instead of full userData object

  // Function to manually stop location tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Function to restart location tracking
  const startTracking = () => {
    if (userData && !watchIdRef.current) {
      // Restart the useEffect logic
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await axios.put(`${serverUrl}/api/user/update-location`, {
                lat: latitude,
                long: longitude,
              }, {
                withCredentials: true,
              });
              
              console.log('Location updated:', response.data);
              
              // Don't update Redux state to avoid infinite loops
            } catch (error) {
              console.error('Location update error:', error);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      }
    }
  };

  return { stopTracking, startTracking };
};

export default useUpdateLocation;
