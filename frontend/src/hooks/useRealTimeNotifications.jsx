import { useSocket } from '../context/SocketContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export const useRealTimeNotifications = () => {
  const { socket } = useSocket();
  const { userData } = useSelector(state => state.user);

  useEffect(() => {
    if (!socket) return;

    if (userData?.role === 'deliveryBoy') {
      socket.on('delivery:newAssignment', (data) => {
        toast.success(`New delivery available! Order from ${data.shop.name}`);
      });
    }

    if (userData?.role === 'customer') {
      socket.on('order:statusUpdate', (data) => {
        toast.success(`Order status updated: ${data.status}`);
      });
    }

    if (userData?.role === 'owner') {
      socket.on('shop:orderUpdate', (data) => {
        toast.success(`New order received!`);
      });
    }

    return () => {
      socket.off('delivery:newAssignment');
      socket.off('order:statusUpdate');
      socket.off('shop:orderUpdate');
    };
  }, [socket, userData?.role]);
};
