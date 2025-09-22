import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import deliveryAPI from '../services/deliveryAPI';
import toast from 'react-hot-toast';

const useDeliveryBoy = () => {
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { userData } = useSelector((state) => state.user);

  // Fetch available deliveries
  const fetchAvailableDeliveries = async () => {
    if (userData?.role !== 'deliveryBoy') return;
    
    try {
      setLoading(true);
      const deliveries = await deliveryAPI.getAvailableDeliveries();
      setAvailableDeliveries(deliveries);
    } catch (error) {
      console.error('Failed to fetch available deliveries:', error);
      toast.error('Failed to load available deliveries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch my assigned deliveries
  const fetchMyDeliveries = async () => {
    if (userData?.role !== 'deliveryBoy') return;
    
    try {
      const deliveries = await deliveryAPI.getMyDeliveries();
      setMyDeliveries(deliveries);
    } catch (error) {
      console.error('Failed to fetch my deliveries:', error);
      toast.error('Failed to load my deliveries');
    }
  };

  // Accept delivery assignment
  const acceptDelivery = async (assignmentId) => {
    try {
      setLoading(true);
      await deliveryAPI.acceptDelivery(assignmentId);
      toast.success('Delivery accepted successfully!');
      
      // Refresh both lists
      await fetchAvailableDeliveries();
      await fetchMyDeliveries();
      
      return true;
    } catch (error) {
      console.error('Failed to accept delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete delivery
  const completeDelivery = async (assignmentId) => {
    try {
      setLoading(true);
      await deliveryAPI.completeDelivery(assignmentId);
      toast.success('Delivery completed successfully!');
      
      // Refresh my deliveries list
      await fetchMyDeliveries();
      
      return true;
    } catch (error) {
      console.error('Failed to complete delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to complete delivery');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Auto-fetch data when component mounts or user changes
  useEffect(() => {
    if (userData?.role === 'deliveryBoy') {
      fetchAvailableDeliveries();
      fetchMyDeliveries();
    }
  }, [userData, refreshKey, fetchAvailableDeliveries, fetchMyDeliveries]);

  // Auto-refresh every 30 seconds for available deliveries
  useEffect(() => {
    if (userData?.role !== 'deliveryBoy') return;

    const interval = setInterval(() => {
      fetchAvailableDeliveries();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userData, fetchAvailableDeliveries]);

  return {
    availableDeliveries,
    myDeliveries,
    loading,
    acceptDelivery,
    completeDelivery,
    refreshData,
    fetchAvailableDeliveries,
    fetchMyDeliveries
  };
};

export default useDeliveryBoy;