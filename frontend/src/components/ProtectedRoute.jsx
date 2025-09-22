import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = null,
  redirectTo = "/login"
}) => {
  const { userData, token } = useSelector(state => state.user);
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Give some time for auth state to be determined
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [userData, token]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !userData) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user is authenticated but shouldn't be (like login/register pages)
  if (!requireAuth && userData) {
    return <Navigate to="/" replace />;
  }

  // Check if specific roles are required
  if (allowedRoles && userData) {
    if (Array.isArray(allowedRoles)) {
      if (!allowedRoles.includes(userData.role)) {
        return <Navigate to="/" replace />;
      }
    } else if (userData.role !== allowedRoles) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;