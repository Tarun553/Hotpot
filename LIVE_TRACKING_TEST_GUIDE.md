# Live Tracking Test Guide

## Prerequisites
1. Backend server running on port (check your server config)
2. Frontend running on Vite dev server
3. MongoDB with geospatial index on User collection
4. Google Maps API key configured in TrackOrder.jsx

## Testing Steps

### 1. Setup Test Users
Create test accounts with these roles:
- **Customer**: Regular user to place orders
- **Shop Owner**: To accept and prepare orders  
- **Delivery Boy**: To accept delivery assignments

### 2. Test Order Flow
1. **Customer places order** → Order status: "pending"
2. **Shop owner accepts order** → Order status: "accepted"
3. **Shop owner marks as preparing** → Order status: "preparing"
   - This triggers delivery boy assignment within 5km radius
4. **Delivery boy accepts assignment** → Order status: "on the way"
5. **Delivery boy completes delivery** → Order status: "delivered"

### 3. Test Live Tracking
1. **Navigate to MyOrders** as customer
2. **Click "Track Order"** button (only visible for "preparing"/"on the way" orders)
3. **Verify Google Maps loads** with:
   - Delivery boy location (scooter icon)
   - Delivery address (home icon)
   - Real-time updates every 10 seconds

### 4. API Endpoints to Test
```
GET /api/orders/:orderId/tracking
- Returns delivery boy location, order status, delivery address
- Updates when delivery boy location changes

PUT /api/user/update-location
- Updates delivery boy location in real-time
- Should work with geolocation API
```

### 5. Expected Behavior
- **Map centers on delivery boy location**
- **Auto-refreshes every 10 seconds**
- **Shows delivery boy name and contact**
- **Status timeline shows order progression**
- **Error handling for missing data**

### 6. Common Issues to Check
- Google Maps API key validity
- MongoDB geospatial index exists
- Location permissions granted
- Backend CORS settings for frontend domain
- Authentication cookies/tokens working

### 7. Test Data Structure
Order tracking response should include:
```json
{
  "deliveryBoy": {
    "name": "John Doe",
    "mobile": "+1234567890",
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    }
  },
  "status": "on the way",
  "statusHistory": [...],
  "deliveryAddress": {...},
  "shop": {...}
}
```

## Success Criteria
✅ Customer can track order in real-time
✅ Google Maps shows live delivery boy location
✅ Order status updates correctly
✅ UI is responsive and user-friendly
✅ Error handling works properly