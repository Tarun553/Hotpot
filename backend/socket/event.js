


export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToDeliveryBoys = (io, deliveryBoyIds, event, data) => {
  deliveryBoyIds.forEach(id => {
    io.to(`user:${id}`).emit(event, data);
  });
};

export const emitOrderUpdate = (io, order) => {
  // Emit to customer
  emitToUser(io, order.user, 'order:statusUpdate', {
    orderId: order._id,
    status: order.orderStatus,
    shopOrders: order.shopOrder
  });
  
  // Emit to shop owners
  order.shopOrder.forEach(shopOrder => {
    emitToUser(io, shopOrder.owner, 'shop:orderUpdate', {
      orderId: order._id,
      shopOrderId: shopOrder._id,
      status: shopOrder.status
    });
  });
};

export const emitLocationUpdate = (io, deliveryBoyId, location, activeOrders) => {
  activeOrders.forEach(order => {
    emitToUser(io, order.user, 'delivery:locationUpdate', {
      orderId: order._id,
      deliveryBoy: {
        id: deliveryBoyId,
        location: location
      }
    });
  });
};