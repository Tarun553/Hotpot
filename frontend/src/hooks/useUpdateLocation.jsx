import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';
import { useEffect, useRef, useCallback } from 'react';
import apiClient from '../utils/axios';

const useUpdateLocation = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const watchIdRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  
  const updateLocationToServer = useCallback(async (latitude, longitude) => {
    try {
      const response = await apiClient.put('/api/user/update-location', {
        lat: latitude,
        long: longitude,
      });
      
      console.log('Location updated:', response.data);
      retryCountRef.current = 0; // Reset retry count on success
      
    } catch (error) {
      console.error('Location update error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        // Authentication error - handled by axios interceptor
        console.log('Authentication error during location update');
      } else if (error.response?.status >= 500) {
        // Server error - retry logic
        retryCountRef.current += 1;
        if (retryCountRef.current < maxRetries) {
          console.log(`Retrying location update (${retryCountRef.current}/${maxRetries})`);
          setTimeout(() => updateLocationToServer(latitude, longitude), 2000 * retryCountRef.current);
        } else {
          toast.error("Failed to update location after multiple attempts");
          retryCountRef.current = 0;
        }
      } else if (!error.response) {
        // Network error
        toast.error("Network error while updating location");
      } else {
        // Other errors
        toast.error("Failed to update location");
      }
    }
  }, []);
  
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
          await updateLocationToServer(latitude, longitude);
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
  }, [userData?.email, updateLocationToServer]); // Added updateLocationToServer to dependencies

  // Function to manually stop location tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Function to restart location tracking
  const startTracking = useCallback(() => {
    if (userData && !watchIdRef.current) {
      // Restart the useEffect logic
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await updateLocationToServer(latitude, longitude);
          },
          (error) => {
            console.error('Geolocation error:', error);
            // Error handling same as above
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
            maximumAge: 60000,
          }
        );
      }
    }
  }, [userData, updateLocationToServer]);

  return { stopTracking, startTracking };
};

export default useUpdateLocation;
