import React from 'react';
import { useSelector } from 'react-redux';
import DeliveryBoyDashboard from '../pages/DeliveryBoyDashboard';
import DeliveryBoySetup from '../pages/DeliveryBoySetup';

const DiliveryBoy = ({ userData }) => {
  // Check if delivery boy has completed profile setup
  // You can add more profile validation logic here if needed
  const hasCompleteProfile = userData && userData.role === 'deliveryBoy';

  if (!hasCompleteProfile) {
    return <DeliveryBoySetup />;
  }

  return <DeliveryBoyDashboard />;
};

export default DiliveryBoy;