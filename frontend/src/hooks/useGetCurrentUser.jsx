import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '@/redux/userSlice'
import apiClient from '../utils/axios'

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const config = {
          withCredentials: true,
        };
        
        // Add Authorization header if token exists
        if (token) {
          config.headers = {
            Authorization: `Bearer ${token}`
          };
        }
        
        const response = await apiClient.get('/api/user/current', config);
        
        if (response.data?.user) {
          dispatch(setUserData(response.data.user));
        }
      
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError(err);
        
        // Only clear user data if it's a 401 error (handled by axios interceptor)
        if (err.response?.status === 401) {
          dispatch(setUserData(null));
        }
      } finally {
        setLoading(false);
      }
    }

    // Only fetch user if we have a token or cookies might be available
    if (token || document.cookie.includes('token')) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, dispatch]);

  return { loading, error };
}

export default useGetCurrentUser