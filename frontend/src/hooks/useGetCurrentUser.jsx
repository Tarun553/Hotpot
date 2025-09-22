import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData, setLoading, setToken } from '@/redux/userSlice'

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // If no token exists, set loading to false and return
        if (!token) {
          dispatch(setLoading(false));
          return;
        }
        
        dispatch(setLoading(true));
        
        const config = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${serverUrl}/api/user/current`, config);
        dispatch(setUserData(response.data.user));
      
      } catch (err) {
        console.error('Error fetching current user:', err);
        // Clear invalid token from both localStorage and Redux
        localStorage.removeItem('token');
        dispatch(setToken(null));
        dispatch(setLoading(false));
      }
    }

    fetchUser()
  }, [token, dispatch])
}

export default useGetCurrentUser