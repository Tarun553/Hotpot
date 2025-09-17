import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Item from "../models/items.model.js";
import Shop from "../models/shop.model.js";

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


// // Get Orders (for both user & shop owner)
// export const getOrders = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const role = req.user.role; // make sure you set this in auth middleware

//     let orders;

//     if (role === "user") {
//       // Normal user → show their own orders
//       orders = await Order.find({ user: userId })
//         .populate({
//           path: "shopOrder.shop",
//           select: "name image",
//         })
//         .populate({
//           path: "shopOrder.shopOrderItems.item",
//           select: "name price image category foodType",
//         })
//         .sort({ createdAt: -1 });

//       return res.json(orders);
//     } 
    
//     if (role === "owner") {
//       // Shop owner → show only orders of their shops
//       orders = await Order.find({ "shopOrder.owner": userId })
//         .populate("user", "name email phone")
//         .populate({
//           path: "shopOrder.shop",
//           select: "name image",
//         })
//         .populate({
//           path: "shopOrder.shopOrderItems.item",
//           select: "name price image category foodType",
//         })
//         .sort({ createdAt: -1 });

//       // Filter shopOrder array to only this owner's shops
//       const filteredOrders = orders
//         .map((order) => ({
//           ...order.toObject(),
//           shopOrder: order.shopOrder.filter(
//             (shopOrder) => shopOrder.owner.toString() === userId.toString()
//           ),
//         }))
//         .filter((order) => order.shopOrder.length > 0);

//       return res.json(filteredOrders);
//     }

//     // if role is something else
//     return res.status(403).json({ message: "Unauthorized role" });

//   } catch (error) {
//     console.error("Get orders error:", error);
//     res.status(500).json({ message: "Failed to fetch orders", error: error.message });
//   }
// };
