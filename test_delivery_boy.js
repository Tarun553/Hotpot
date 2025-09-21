// Test function to create a delivery boy near the test location
// Add this to your user controller for testing

export const createTestDeliveryBoy = async (req, res) => {
  try {
    const testDeliveryBoy = new User({
      fullName: "Test Delivery Boy",
      email: "testdelivery@example.com",
      password: "password123", // You should hash this
      mobile: 9999999999,
      role: "deliveryBoy",
      location: {
        type: "Point",
        coordinates: [75.8577258, 22.7195687] // Same as your test order location
      }
    });

    await testDeliveryBoy.save();
    
    res.json({
      message: "Test delivery boy created successfully",
      deliveryBoy: testDeliveryBoy
    });
  } catch (error) {
    console.error("Error creating test delivery boy:", error);
    res.status(500).json({ 
      message: "Failed to create test delivery boy",
      error: error.message 
    });
  }
};

// Alternative: Update existing user to delivery boy with location
export const updateUserToDeliveryBoy = async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role: "deliveryBoy",
        location: {
          type: "Point", 
          coordinates: [longitude, latitude] // [lng, lat]
        }
      },
      { new: true }
    );

    res.json({
      message: "User updated to delivery boy successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user to delivery boy:", error);
    res.status(500).json({ 
      message: "Failed to update user",
      error: error.message 
    });
  }
};