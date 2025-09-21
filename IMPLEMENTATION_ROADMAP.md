# 🚀 VINGO FOOD DELIVERY - IMPLEMENTATION ROADMAP

## 📋 **FEATURES TO IMPLEMENT**

1. **Filter Food Items by Category** 🍕
2. **Shop Listings in User Dashboard** 🏪
3. **Search Functionality** 🔍
4. **Socket.IO Real-time Features** ⚡

---

## 🎯 **PHASE 1: FILTER FOOD ITEMS BY CATEGORY**

### **Backend Changes Needed:**
```
✅ Already have categories in Item model
❌ Need API endpoint for filtering
```

#### **Step 1.1: Update Item Routes**
**File**: `backend/routes/item.route.js`
```javascript
// Add new route
itemRouter.get('/filter/:shopId', isAuth, getItemsByCategory);
```

#### **Step 1.2: Create Filter Controller**
**File**: `backend/controllers/items.controller.js`
```javascript
export const getItemsByCategory = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { category, foodType, minPrice, maxPrice } = req.query;
    
    let filter = { shop: shopId };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (foodType && foodType !== 'all') {
      filter.foodType = foodType;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const items = await Item.find(filter).populate('shop', 'name');
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: "Filter items error", error: error.message });
  }
};
```

#### **Step 1.3: Create Filter Component**
**File**: `frontend/src/components/ItemFilter.jsx`
```javascript
import React, { useState } from 'react';

const ItemFilter = ({ onFilter, categories }) => {
  const [filters, setFilters] = useState({
    category: 'all',
    foodType: 'all',
    minPrice: '',
    maxPrice: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="font-semibold mb-4">Filter Items</h3>
      
      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Category</label>
        <select 
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Food Type Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Food Type</label>
        <select 
          value={filters.foodType}
          onChange={(e) => handleFilterChange('foodType', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="all">All Types</option>
          <option value="veg">Vegetarian</option>
          <option value="non-veg">Non-Vegetarian</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="₹0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="₹1000"
          />
        </div>
      </div>
    </div>
  );
};

export default ItemFilter;
```

---

## 🏪 **PHASE 2: SHOP LISTINGS IN USER DASHBOARD**

### **Backend Changes:**
```
✅ Already have getAllShops endpoint
❌ Need shop details with items count
❌ Need distance calculation (optional)
```

#### **Step 2.1: Enhance Shop Controller**
**File**: `backend/controllers/shop.controller.js`
```javascript
export const getShopsWithDetails = async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate('owner', 'fullName email mobile')
      .populate('items');
    
    const shopsWithDetails = shops.map(shop => ({
      ...shop.toObject(),
      itemsCount: shop.items.length,
      categories: [...new Set(shop.items.map(item => item.category))],
      priceRange: {
        min: Math.min(...shop.items.map(item => item.price)),
        max: Math.max(...shop.items.map(item => item.price))
      }
    }));
    
    res.status(200).json({ shops: shopsWithDetails });
  } catch (error) {
    res.status(500).json({ message: "Get shops error", error: error.message });
  }
};
```

#### **Step 2.2: Create Shop Card Component**
**File**: `frontend/src/components/ShopCard.jsx`
```javascript
import React from 'react';
import { Link } from 'react-router-dom';

const ShopCard = ({ shop }) => {
  return (
    <Link to={`/shop/${shop._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <img 
          src={shop.image || '/default-restaurant.jpg'} 
          alt={shop.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{shop.name}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {shop.city}, {shop.state}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {shop.itemsCount} items
            </span>
            <span className="text-sm font-medium text-orange-600">
              ₹{shop.priceRange?.min}-{shop.priceRange?.max}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {shop.categories?.slice(0, 3).map(category => (
                <span 
                  key={category}
                  className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
```

#### **Step 2.3: Update UserDashboard**
**File**: `frontend/src/components/UserDashboard.jsx`
```javascript
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import ShopCard from './ShopCard';
import axios from 'axios';

const UserDashboard = ({ userData }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('/api/shop/get-all-shops');
        setShops(response.data.shops);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userData.fullName}!
          </h1>
          <p className="text-gray-600">Discover delicious food from local restaurants</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map(shop => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
```

---

## 🔍 **PHASE 3: SEARCH FUNCTIONALITY**

### **Step 3.1: Backend Search API**
**File**: `backend/routes/search.route.js`
```javascript
import express from 'express';
import { searchShopsAndItems } from '../controllers/search.controller.js';
import { isAuth } from '../middlewares/isAuth.js';

const searchRouter = express.Router();

searchRouter.get('/', isAuth, searchShopsAndItems);

export default searchRouter;
```

### **Step 3.2: Search Controller**
**File**: `backend/controllers/search.controller.js`
```javascript
import Shop from '../models/shop.model.js';
import Item from '../models/items.model.js';

export const searchShopsAndItems = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const searchRegex = new RegExp(q, 'i');
    let results = { shops: [], items: [] };

    if (type === 'all' || type === 'shops') {
      results.shops = await Shop.find({
        $or: [
          { name: searchRegex },
          { city: searchRegex },
          { address: searchRegex }
        ]
      }).populate('items').limit(10);
    }

    if (type === 'all' || type === 'items') {
      results.items = await Item.find({
        $or: [
          { name: searchRegex },
          { category: searchRegex }
        ]
      }).populate('shop', 'name city').limit(20);
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Search error", error: error.message });
  }
};
```

### **Step 3.3: Search Component**
**File**: `frontend/src/components/SearchBar.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';

const SearchBar = ({ onResults }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.length > 2) {
        handleSearch();
      } else {
        onResults({ shops: [], items: [] });
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await axios.get(`/api/search?q=${query}`);
      onResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for restaurants or food items..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
```

---

## ⚡ **PHASE 4: SOCKET.IO REAL-TIME FEATURES**

### **Step 4.1: Install Socket.IO**
```bash
# Backend
cd backend
npm install socket.io

# Frontend
cd ../frontend
npm install socket.io-client
```

### **Step 4.2: Setup Socket.IO Server**
**File**: `backend/socket/socketManager.js`
```javascript
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

class SocketManager {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.userSockets = new Map(); // userId -> socketId
    this.deliveryBoySockets = new Map(); // userId -> socketId
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected with role ${socket.userRole}`);
      
      // Store socket connection
      if (socket.userRole === 'deliveryBoy') {
        this.deliveryBoySockets.set(socket.userId, socket.id);
      } else {
        this.userSockets.set(socket.userId, socket.id);
      }

      // Join role-specific rooms
      socket.join(socket.userRole);
      socket.join(`user_${socket.userId}`);

      // Handle location updates for delivery boys
      socket.on('location_update', (data) => {
        if (socket.userRole === 'deliveryBoy') {
          this.handleLocationUpdate(socket, data);
        }
      });

      // Handle order status updates
      socket.on('order_status_update', (data) => {
        this.handleOrderStatusUpdate(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.userSockets.delete(socket.userId);
        this.deliveryBoySockets.delete(socket.userId);
      });
    });
  }

  handleLocationUpdate(socket, { orderId, latitude, longitude }) {
    // Broadcast location to customer and restaurant
    socket.to(`order_${orderId}`).emit('delivery_location_update', {
      orderId,
      location: { latitude, longitude },
      timestamp: new Date()
    });
  }

  handleOrderStatusUpdate(socket, { orderId, status, customerId, restaurantId }) {
    // Notify customer
    this.io.to(`user_${customerId}`).emit('order_status_changed', {
      orderId,
      status,
      timestamp: new Date()
    });

    // Notify restaurant
    this.io.to(`user_${restaurantId}`).emit('order_status_changed', {
      orderId,
      status,
      timestamp: new Date()
    });
  }

  // Helper methods for controllers
  notifyOrderPlaced(orderId, restaurantOwnerId) {
    this.io.to(`user_${restaurantOwnerId}`).emit('new_order', {
      orderId,
      message: 'New order received!',
      timestamp: new Date()
    });
  }

  notifyDeliveryAssigned(orderId, deliveryBoyId, customerId) {
    this.io.to(`user_${deliveryBoyId}`).emit('delivery_assigned', {
      orderId,
      message: 'New delivery assigned!',
      timestamp: new Date()
    });

    this.io.to(`user_${customerId}`).emit('delivery_assigned', {
      orderId,
      message: 'Delivery person assigned!',
      timestamp: new Date()
    });
  }
}

export default SocketManager;
```

### **Step 4.3: Update Backend Index.js**
**File**: `backend/index.js`
```javascript
import express from "express";
import cors from "cors";
import http from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import shopRouter from "./routes/shop.route.js";
import UserRouter from "./routes/user.route.js";
import itemRouter from "./routes/item.route.js";
import searchRouter from "./routes/search.route.js";
import cookieParser from "cookie-parser";
import SocketManager from "./socket/socketManager.js";

const app = express();
const server = http.createServer(app);

connectDB();

// Initialize Socket.IO
const socketManager = new SocketManager(server);

// Make socketManager available to routes
app.set('socketManager', socketManager);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", UserRouter);
app.use("/api/shop", shopRouter);
app.use("/api/items", itemRouter);
app.use("/api/search", searchRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

export { socketManager };
```

### **Step 4.4: Frontend Socket Hook**
**File**: `frontend/src/hooks/useSocket.js`
```javascript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const useSocket = () => {
  const socket = useRef(null);
  const { userData } = useSelector(state => state.user);

  useEffect(() => {
    if (userData) {
      // Initialize socket connection
      socket.current = io('http://localhost:3000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socket.current.on('connect', () => {
        console.log('Connected to server');
      });

      socket.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      return () => {
        socket.current?.disconnect();
      };
    }
  }, [userData]);

  const emitLocationUpdate = (data) => {
    socket.current?.emit('location_update', data);
  };

  const emitOrderStatusUpdate = (data) => {
    socket.current?.emit('order_status_update', data);
  };

  const subscribeToEvent = (event, callback) => {
    socket.current?.on(event, callback);
    
    return () => {
      socket.current?.off(event, callback);
    };
  };

  return {
    socket: socket.current,
    emitLocationUpdate,
    emitOrderStatusUpdate,
    subscribeToEvent
  };
};

export default useSocket;
```

---

## 📅 **IMPLEMENTATION TIMELINE**

### **Week 1: Filter & Shop Listings**
- [ ] Day 1-2: Implement filter API and frontend component
- [ ] Day 3-4: Create shop listing in user dashboard
- [ ] Day 5-7: Test and refine filtering/listing features

### **Week 2: Search Functionality**
- [ ] Day 1-3: Implement search API and backend logic
- [ ] Day 4-5: Create search component and integrate
- [ ] Day 6-7: Add search results UI and testing

### **Week 3: Socket.IO Integration**
- [ ] Day 1-2: Setup Socket.IO server and authentication
- [ ] Day 3-4: Implement real-time order updates
- [ ] Day 5-6: Add delivery tracking real-time features
- [ ] Day 7: Testing and optimization

---

## 🛠️ **IMPLEMENTATION ORDER**

### **Priority 1: Shop Listings (Must Have)**
This gives users something to browse immediately.

### **Priority 2: Filter System (High)**
Enhances user experience significantly.

### **Priority 3: Search Functionality (High)**
Essential for finding specific items/restaurants.

### **Priority 4: Socket.IO (Medium)**
Great for real-time updates but not blocking for basic functionality.

---

## 🧪 **TESTING CHECKLIST**

### **Filter Testing**
- [ ] Filter by category works
- [ ] Filter by food type works
- [ ] Price range filtering works
- [ ] Multiple filters work together
- [ ] Reset filters functionality

### **Shop Listings Testing**
- [ ] All shops display correctly
- [ ] Shop cards show proper information
- [ ] Navigation to shop details works
- [ ] Loading states work properly

### **Search Testing**
- [ ] Search returns relevant results
- [ ] Search handles empty queries
- [ ] Search has debounced input
- [ ] Search results navigation works

### **Socket.IO Testing**
- [ ] Real-time order updates work
- [ ] Delivery location tracking works
- [ ] Notifications appear correctly
- [ ] Connection/disconnection handled properly

---

## 📦 **NEW DEPENDENCIES NEEDED**

### **Backend**
```bash
npm install socket.io
```

### **Frontend**
```bash
npm install socket.io-client react-icons
```

---

## 🎯 **NEXT STEPS TO START**

1. **Create new feature branch**:
   ```bash
   git checkout -b feature/user-experience-enhancements
   ```

2. **Start with Shop Listings** (easiest to implement)

3. **Follow the phases in order** for systematic development

4. **Test each phase** before moving to the next

This roadmap will transform your app from a basic restaurant management system to a full-featured food delivery platform with real-time capabilities! 🚀