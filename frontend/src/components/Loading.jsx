import React from 'react';
import { ClipLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <ClipLoader color="#ea580c" size={50} />
        <p className="text-orange-600 mt-4 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;