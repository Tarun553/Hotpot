import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

async function inspectIndex() {
  try {
    console.log('🔍 Inspecting Pinecone index...');
    
    // Get index stats
    const stats = await pineconeIndex.describeIndexStats();
    console.log('📊 Index stats:', JSON.stringify(stats, null, 2));
    
    // Try to fetch some vectors by ID
    const vectorIds = [
      'shop-68d1bd7c44e440369d13f002',
      'item-68d1ee8f372bd947148b97e4'
    ];
    
    for (const id of vectorIds) {
      try {
        const result = await pineconeIndex.fetch([id]);
        console.log(`\n📄 Vector ${id}:`, JSON.stringify(result, null, 2));
      } catch (err) {
        console.log(`❌ Could not fetch ${id}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error inspecting index:', error);
  }
}

inspectIndex();