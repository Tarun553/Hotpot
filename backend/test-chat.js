// Test script for chat endpoint
import axios from 'axios';

async function testChatEndpoint() {
  try {
    console.log('🧪 Testing chat endpoint...');
    
    // Test 1: GET /api/chat/test
    console.log('\n1. Testing GET /api/chat/test');
    const testResponse = await axios.get('http://localhost:3000/api/chat/test');
    console.log('✅ GET test response:', testResponse.data);
    
    // Test 2: POST /api/chat
    console.log('\n2. Testing POST /api/chat');
    const chatResponse = await axios.post('http://localhost:3000/api/chat', {
      query: 'What restaurants are available in Bhopal?'
    });
    console.log('✅ POST chat response:', chatResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testChatEndpoint();