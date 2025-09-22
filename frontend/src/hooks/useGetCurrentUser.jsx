import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '@/redux/userSlice'

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const config = {
          withCredentials: true,
        };
        
        // Add Authorization header if token exists
        if (token) {
          config.headers = {
            Authorization: `Bearer ${token}`
          };
        }
        
        const response = await axios.get(`${serverUrl}/api/user/current`, config);
        dispatch(setUserData(response.data.user));
      
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    }

    fetchUser()
  }, [token, dispatch])
}

export default useGetCurrentUser