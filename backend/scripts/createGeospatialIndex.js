import mongoose from 'mongoose';
import User from '../models/user.model.js';

// Script to ensure geospatial index is created
const createGeospatialIndex = async () => {
  try {
    console.log('🔍 Checking existing indexes...');
    
    // Get existing indexes
    const indexes = await User.collection.getIndexes();
    console.log('📋 Existing indexes:', Object.keys(indexes));
    
    // Check if location index exists
    const hasLocationIndex = Object.keys(indexes).some(indexName => 
      indexName.includes('location') || indexName.includes('2dsphere')
    );
    
    if (hasLocationIndex) {
      console.log('✅ Geospatial index already exists');
    } else {
      console.log('🔧 Creating 2dsphere index for location field...');
      
      // Create the index
      await User.collection.createIndex({ "location": "2dsphere" });
      
      console.log('✅ Geospatial index created successfully!');
    }
    
    // Verify the index was created
    const newIndexes = await User.collection.getIndexes();
    console.log('📋 Updated indexes:', Object.keys(newIndexes));
    
    // Test the geospatial query
    console.log('🧪 Testing geospatial query...');
    const testQuery = await User.find({
      role: "deliveryBoy",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [77.4667546, 23.2519889] // Test coordinates
          },
          $maxDistance: 5000
        }
      }
    }).limit(1);
    
    console.log('✅ Geospatial query test successful!');
    console.log(`📍 Found ${testQuery.length} delivery boys in test query`);
    
  } catch (error) {
    console.error('❌ Error creating geospatial index:', error);
  }
};

export default createGeospatialIndex;