import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';
import useGetCurrentUser from '../hooks/useGetCurrentUser';

const AppInitializer = ({ children }) => {
  const { userData, token } = useSelector(state => state.user);
  const { loading: userLoading } = useGetCurrentUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // App is initialized when:
    // 1. User loading is complete
    // 2. Either we have user data or no token (guest mode)
    if (!userLoading && (userData || !token)) {
      setIsInitialized(true);
    }
  }, [userLoading, userData, token]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-orange-600 mb-2">Hotpot 🔥</h1>
            <p className="text-orange-500">Delicious food, delivered fast</p>
          </div>
          <LoadingSpinner message="Starting up the app..." />
        </div>
      </div>
    );
  }

  return children;
};

export default AppInitializer;