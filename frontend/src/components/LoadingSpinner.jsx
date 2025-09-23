import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ 
  size = 35, 
  color = "#f97316", 
  loading = true, 
  fullScreen = false,
  message = "Loading..."
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <ClipLoader size={size} color={color} loading={loading} />
      {message && (
        <p className="text-gray-600 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default LoadingSpinner;