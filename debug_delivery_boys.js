// MongoDB Query to Check Delivery Boys
// Run this in MongoDB Compass or MongoDB Shell

// 1. Check all delivery boys
db.users.find({role: "deliveryBoy"}, {
  fullName: 1,
  email: 1,
  location: 1,
  role: 1
}).pretty()

// 2. Check delivery boys with location data
db.users.find({
  role: "deliveryBoy",
  "location.coordinates": {$exists: true, $ne: [0, 0]}
}, {
  fullName: 1,
  email: 1,
  location: 1
}).pretty()

// 3. Check delivery boys near test location (22.7195687, 75.8577258)
db.users.find({
  role: "deliveryBoy",
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [75.8577258, 22.7195687] // [longitude, latitude]
      },
      $maxDistance: 10000 // 10km for testing
    }
  }
}).pretty()

// 4. Count total delivery boys
db.users.countDocuments({role: "deliveryBoy"})

// 5. Count delivery boys with location
db.users.countDocuments({
  role: "deliveryBoy", 
  "location.coordinates": {$exists: true, $ne: [0, 0]}
})