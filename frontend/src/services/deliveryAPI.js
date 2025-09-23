import apiClient from '../utils/axios';

// Delivery Boy API Services
export const deliveryAPI = {
  // Get available delivery assignments within 5km
  getAvailableDeliveries: async () => {
    try {
      const response = await apiClient.get('/api/delivery/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available deliveries:', error);
      throw error;
    }
  },

  // Accept a delivery assignment
  acceptDelivery: async (assignmentId) => {
    try {
      const response = await apiClient.post(`/api/delivery/accept/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error accepting delivery:', error);
      throw error;
    }
  },

  // Get my assigned deliveries
  getMyDeliveries: async () => {
    try {
      const response = await apiClient.get('/api/delivery/my-deliveries');
      return response.data;
    } catch (error) {
      console.error('Error fetching my deliveries:', error);
      throw error;
    }
  },

  // Complete a delivery
  completeDelivery: async (assignmentId) => {
    try {
      const response = await apiClient.post(`/api/delivery/complete/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error completing delivery:', error);
      throw error;
    }
  },

  // Update order status (for shop owners)
  updateOrderStatus: async (orderId, shopId, status) => {
    try {
      const response = await apiClient.put(`/api/orders/${orderId}/${shopId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

export default deliveryAPI;