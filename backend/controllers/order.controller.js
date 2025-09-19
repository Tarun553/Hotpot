import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Item from "../models/items.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";

// Helper function to find delivery boys within 5km radius
const findNearbyDeliveryBoys = async (latitude, longitude, maxDistance = 5000) => {
  try {
    console.log(`🔍 Searching for delivery boys within ${maxDistance}m of coordinates: ${latitude}, ${longitude}`);
    
    const deliveryBoys = await User.find({
      role: "deliveryBoy",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude], // MongoDB expects [longitude, latitude]
          },
          $maxDistance: maxDistance, // Distance in meters (5km = 5000m)
        },
      },
    }).select("fullName email mobile location");

    console.log(`📍 Found ${deliveryBoys.length} delivery boys within 5km:`);
    deliveryBoys.forEach(db => {
      console.log(`- ${db.fullName} (${db.email}) at [${db.location.coordinates}]`);
    });

    return deliveryBoys;
  } catch (error) {
    console.error("❌ Error finding nearby delivery boys:", error);
    return [];
  }
};

// Helper function to create delivery assignment
const createDeliveryAssignment = async (orderId, shopId, shopOrderId, deliveryAddress) => {
  try {
    console.log(`🎯 Creating delivery assignment for order ${orderId}`);
    
    // Find nearby delivery boys
    const nearbyDeliveryBoys = await findNearbyDeliveryBoys(
      deliveryAddress.latitude,
      deliveryAddress.longitude
    );

    if (nearbyDeliveryBoys.length === 0) {
      console.log("❌ No delivery boys found within 5km radius");
      return null;
    }

    // Create delivery assignment and broadcast to nearby delivery boys
    const deliveryAssignment = new DeliveryAssignment({
      order: orderId,
      shop: shopId,
      shopOrderId: shopOrderId,
      broadcastedTo: nearbyDeliveryBoys.map(db => db._id),
      status: "broadcasted",
    });

    await deliveryAssignment.save();
    
    console.log(`✅ Order broadcasted to ${nearbyDeliveryBoys.length} delivery boys within 5km`);
    console.log(`📋 Assignment ID: ${deliveryAssignment._id}`);
    
    return deliveryAssignment;
  } catch (error) {
    console.error("❌ Error creating delivery assignment:", error);
    return null;
  }
};

// Place Order - Groups cart items by shop and creates orders
export const placeOrder = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress, cartItems } = req.body;
    const userId = req.userId; // Changed from req.user._id to req.userId

    console.log("Place order request:", { paymentMethod, deliveryAddress, userId, hasCartItems: !!cartItems });

    // Validate required fields
    if (!paymentMethod || !deliveryAddress) {
      return res.status(400).json({ 
        message: "Payment method and delivery address are required" 
      });
    }

    let cartItemsToProcess;

    // If cartItems are provided in request body, use them, otherwise get from DB
    if (cartItems && cartItems.length > 0) {
      // Validate and populate items from request
      const itemIds = cartItems.map(item => item.itemId || item.id);
      const items = await Item.find({ _id: { $in: itemIds } }).populate('shop');
      
      cartItemsToProcess = cartItems.map(cartItem => {
        const item = items.find(i => i._id.toString() === (cartItem.itemId || cartItem.id));
        if (!item) {
          throw new Error(`Item not found: ${cartItem.itemId || cartItem.id}`);
        }
        return {
          itemId: item,
          quantity: cartItem.quantity,
          price: cartItem.price || item.price
        };
      });
    } else {
      // Get user's cart from database
      const cart = await Cart.findOne({ userId }).populate({
        path: 'items.itemId',
        populate: {
          path: 'shop',
          model: 'Shop'
        }
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      cartItemsToProcess = cart.items;
    }

    if (!cartItemsToProcess || cartItemsToProcess.length === 0) {
      return res.status(400).json({ message: "No items to order" });
    }

    // Group cart items by shop
    const shopGroups = {};
    
    for (const cartItem of cartItemsToProcess) {
      const item = cartItem.itemId;
      if (!item || !item.shop) {
        console.error("Item or shop missing:", cartItem);
        continue;
      }
      
      const shopId = item.shop._id.toString();
      
      if (!shopGroups[shopId]) {
        shopGroups[shopId] = {
          shop: item.shop,
          items: [],
          subtotal: 0
        };
      }
      
      const itemTotal = cartItem.price * cartItem.quantity;
      shopGroups[shopId].items.push({
        item: item._id,
        quantity: cartItem.quantity,
        price: cartItem.price
      });
      shopGroups[shopId].subtotal += itemTotal;
    }

    // Create shop orders array
    const shopOrders = [];
    let totalAmount = 0;

    for (const [shopId, group] of Object.entries(shopGroups)) {
      shopOrders.push({
        shop: shopId,
        owner: group.shop.owner,
        subtotal: group.subtotal,
        shopOrderItems: group.items
      });
      totalAmount += group.subtotal;
    }

    // Add delivery fee (you can customize this logic)
    const deliveryFee = 40;
    totalAmount += deliveryFee;

    // Create the order
    const order = new Order({
      user: userId,
      paymentMethod,
      deliveryAddress: {
        text: deliveryAddress.text,
        latitude: deliveryAddress.latitude,
        longitude: deliveryAddress.longitude
      },
      totalAmount,
      shopOrder: shopOrders
    });

    const savedOrder = await order.save();

    // Clear the cart after successful order (only if using DB cart)
    if (!req.body.cartItems) {
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
      );
    }

    // Populate the order for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'name email')
      .populate({
        path: 'shopOrder.shop',
        select: 'name image'
      })
      .populate({
        path: 'shopOrder.owner',
        select: 'name email'
      })
      .populate({
        path: 'shopOrder.shopOrderItems.item',
        select: 'name price image category foodType'
      });

    res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder
    });

  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // Changed from req.user._id
    
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'shopOrder.shop',
        select: 'name image'
      })
      .populate({
        path: 'shopOrder.shopOrderItems.item',
        select: 'name price image category foodType'
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId; // Changed from req.user._id

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('user', 'name email phone')
      .populate({
        path: 'shopOrder.shop',
        select: 'name image address phone'
      })
      .populate({
        path: 'shopOrder.owner',
        select: 'name email'
      })
      .populate({
        path: 'shopOrder.shopOrderItems.item',
        select: 'name price image category foodType'
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

// Get orders for shop owner
export const getShopOrders = async (req, res) => {
  try {
    const ownerId = req.userId; // Changed from req.user._id
    
    const orders = await Order.find({ 
      'shopOrder.owner': ownerId 
    })
    .populate('user', 'name email phone')
    .populate({
      path: 'shopOrder.shop',
      select: 'name image'
    })
    .populate({
      path: 'shopOrder.shopOrderItems.item',
      select: 'name price image category foodType'
    })
    .sort({ createdAt: -1 });

    // Filter to only show shop orders for this owner
    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      shopOrder: order.shopOrder.filter(shopOrder => 
        shopOrder.owner.toString() === ownerId.toString()
      )
    })).filter(order => order.shopOrder.length > 0);

    res.json(filteredOrders);
  } catch (error) {
    console.error("Get shop orders error:", error);
    res.status(500).json({ message: "Failed to fetch shop orders", error: error.message });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const ownerId = req.userId;
    console.log("Owner ID:", ownerId);
    console.log("Order ID:", orderId);
    console.log("New Status:", status);

    // ✅ Validate status
    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "on the way",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // First, get the order to access delivery address
    const existingOrder = await Order.findOne({ 
      _id: orderId, 
      "shopOrder.owner": ownerId 
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found or not authorized" });
    }

    // Find the specific shop order
    const shopOrder = existingOrder.shopOrder.find(so => so.owner.toString() === ownerId.toString());
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    // ✅ Update the shopOrder status + push into statusHistory in one go
    const order = await Order.findOneAndUpdate(
      { _id: orderId, "shopOrder.owner": ownerId },
      {
        $set: { "shopOrder.$.status": status },
        $push: {
          "shopOrder.$.statusHistory": { status, updatedAt: new Date() },
        },
      },
      { new: true } // return updated doc
    )
      .populate("user", "name email phone")
      .populate("shopOrder.shop", "name image address phone")
      .populate("shopOrder.owner", "name email")
      .populate(
        "shopOrder.shopOrderItems.item",
        "name price image category foodType"
      );

    // ✅ Auto-assign delivery boys when status changes to "preparing"
    if (status === "preparing" && existingOrder.deliveryAddress) {
      console.log(`🚚 Order status changed to 'preparing' - attempting delivery assignment`);
      console.log(`📍 Delivery address: ${JSON.stringify(existingOrder.deliveryAddress)}`);
      
      try {
        // Check if delivery assignment already exists for this shop order
        const existingAssignment = await DeliveryAssignment.findOne({
          order: orderId,
          shop: shopId,
          shopOrderId: shopOrder._id
        });

        if (!existingAssignment) {
          console.log("🔄 Creating new delivery assignment for order:", orderId);
          
          const deliveryAssignment = await createDeliveryAssignment(
            orderId,
            shopId,
            shopOrder._id,
            existingOrder.deliveryAddress
          );

          if (deliveryAssignment) {
            // Update the shop order with the delivery assignment reference
            await Order.findOneAndUpdate(
              { 
                _id: orderId, 
                "shopOrder._id": shopOrder._id 
              },
              {
                $set: { "shopOrder.$.assigment": deliveryAssignment._id },
              }
            );
            
            console.log("✅ Delivery assignment created and linked to order");
          } else {
            console.log("⚠️ Failed to create delivery assignment - no delivery boys found within 5km");
          }
        } else {
          console.log("ℹ️ Delivery assignment already exists for this order");
        }
      } catch (assignmentError) {
        console.error("❌ Error in delivery assignment:", assignmentError);
        // Don't fail the order status update if delivery assignment fails
      }
    } else if (status === "preparing") {
      console.log("⚠️ Order status is 'preparing' but no delivery address found");
    }

    return res.json({ 
      message: "Order status updated", 
      order,
      ...(status === "preparing" ? { deliveryAssignmentAttempted: true } : {})
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};


export const rate = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { ratings } = req.body; // Expecting an array of { itemId, rating, review }
    const userId = req.userId;
    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ message: "Ratings are required" });
    }
    // Verify order belongs to user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Update each item's ratings
    for (const r of ratings) {
      const { itemId, rating, review } = r;
      if (!itemId || !rating) continue;
      await Item.findByIdAndUpdate(itemId, {
        $push: { ratings: { user: userId, rating, review } }
      });
    }
    res.json({ message: "Ratings submitted successfully" });
  } catch (error) {
    console.error("Submit ratings error:", error);
    res.status(500).json({ message: "Failed to submit ratings", error: error.message });
  }
};

// ✅ Get available delivery assignments for delivery boys
export const getAvailableDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    // Find delivery assignments that were broadcasted to this delivery boy
    const availableDeliveries = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
      assignedTo: null
    })
    .populate({
      path: "order",
      select: "deliveryAddress totalAmount createdAt",
      populate: {
        path: "user",
        select: "fullName mobile"
      }
    })
    .populate("shop", "name address phone")
    .sort({ assignedAt: -1 });

    res.json(availableDeliveries);
  } catch (error) {
    console.error("Get available deliveries error:", error);
    res.status(500).json({ message: "Failed to fetch available deliveries", error: error.message });
  }
};

// ✅ Accept delivery assignment
export const acceptDelivery = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const deliveryBoyId = req.userId;

    // Check if delivery boy was broadcasted to and assignment is still available
    const assignment = await DeliveryAssignment.findOne({
      _id: assignmentId,
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
      assignedTo: null
    });

    if (!assignment) {
      return res.status(404).json({ message: "Delivery assignment not found or already taken" });
    }

    // Assign delivery to this delivery boy
    assignment.assignedTo = deliveryBoyId;
    assignment.status = "assigned";
    await assignment.save();

    // Update the shop order status to "on the way"
    await Order.findOneAndUpdate(
      { 
        _id: assignment.order,
        "shopOrder._id": assignment.shopOrderId 
      },
      {
        $set: { "shopOrder.$.status": "on the way" },
        $push: {
          "shopOrder.$.statusHistory": { 
            status: "on the way", 
            updatedAt: new Date() 
          },
        },
      }
    );

    res.json({ message: "Delivery accepted successfully", assignment });
  } catch (error) {
    console.error("Accept delivery error:", error);
    res.status(500).json({ message: "Failed to accept delivery", error: error.message });
  }
};

// ✅ Get assigned deliveries for delivery boy
export const getMyDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const myDeliveries = await DeliveryAssignment.find({
      assignedTo: deliveryBoyId,
      status: { $in: ["assigned"] }
    })
    .populate({
      path: "order",
      select: "deliveryAddress totalAmount createdAt",
      populate: {
        path: "user",
        select: "fullName mobile"
      }
    })
    .populate("shop", "name address phone")
    .sort({ assignedAt: -1 });

    res.json(myDeliveries);
  } catch (error) {
    console.error("Get my deliveries error:", error);
    res.status(500).json({ message: "Failed to fetch my deliveries", error: error.message });
  }
};

// ✅ Complete delivery
export const completeDelivery = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const deliveryBoyId = req.userId;

    // Find the assignment
    const assignment = await DeliveryAssignment.findOne({
      _id: assignmentId,
      assignedTo: deliveryBoyId,
      status: "assigned"
    });

    if (!assignment) {
      return res.status(404).json({ message: "Delivery assignment not found" });
    }

    // Mark assignment as completed
    assignment.status = "completed";
    await assignment.save();

    // Update the shop order status to "delivered"
    await Order.findOneAndUpdate(
      { 
        _id: assignment.order,
        "shopOrder._id": assignment.shopOrderId 
      },
      {
        $set: { "shopOrder.$.status": "delivered" },
        $push: {
          "shopOrder.$.statusHistory": { 
            status: "delivered", 
            updatedAt: new Date() 
          },
        },
      }
    );

    res.json({ message: "Delivery completed successfully", assignment });
  } catch (error) {
    console.error("Complete delivery error:", error);
    res.status(500).json({ message: "Failed to complete delivery", error: error.message });
  }
};
