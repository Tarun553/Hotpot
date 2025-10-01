// it is used for testing the pinecone database and embedding generation ASD
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config({path: '../.env'});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

async function diagnosePinecone() {
    console.log("🔍 Pinecone Diagnostic Tool");
    console.log("=".repeat(50));
    
    try {
        // 1. Check index stats
        console.log("📊 Checking index statistics...");
        const stats = await pineconeIndex.describeIndexStats();
        console.log("Index stats:", JSON.stringify(stats, null, 2));
        
        // 2. Test a simple query to see what data structure exists
        console.log("\n🔍 Testing a simple search...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });
        
        const testQuery = "restaurants";
        const queryVector = await embeddings.embedQuery(testQuery);
        
        const searchResults = await pineconeIndex.query({
            topK: 5,
            vector: queryVector,
            includeMetadata: true,
        });
        
        console.log(`\n📋 Search results for "${testQuery}":`);
        console.log(`Found ${searchResults.matches?.length || 0} matches`);
        
        searchResults.matches?.forEach((match, index) => {
            console.log(`\n--- Match ${index + 1} ---`);
            console.log(`ID: ${match.id}`);
            console.log(`Score: ${match.score?.toFixed(4)}`);
            console.log(`Metadata keys:`, Object.keys(match.metadata || {}));
            console.log(`Metadata:`, JSON.stringify(match.metadata, null, 2));
            
            // Check all possible content fields
            const contentFields = [
                'pageContent',
                'text', 
                'content',
                'metadata.pageContent',
                'metadata.text',
                'metadata.content'
            ];
            
            contentFields.forEach(field => {
                let value;
                if (field.startsWith('metadata.')) {
                    const key = field.split('.')[1];
                    value = match.metadata?.[key];
                } else {
                    value = match[field];
                }
                
                if (value) {
                    console.log(`${field}:`, value.substring(0, 200) + (value.length > 200 ? '...' : ''));
                }
            });
        });
        
        // 3. List some vector IDs to understand the data structure
        console.log("\n📝 Attempting to fetch specific vectors...");
        const fetchResults = await pineconeIndex.fetch(['shop-1', 'item-1', 'doc-0', 'chunk-0']);
        console.log("Fetch results:", JSON.stringify(fetchResults, null, 2));
        
    } catch (error) {
        console.error("❌ Diagnostic error:", error.message);
        console.error("Full error:", error);
    }
}

async function testEmbedding() {
    console.log("\n🧪 Testing embedding generation...");
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });
        
        const testText = "Pizza restaurant in Mumbai";
        const vector = await embeddings.embedQuery(testText);
        console.log(`✅ Embedding successful. Vector length: ${vector.length}`);
        console.log(`Sample values: [${vector.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    } catch (error) {
        console.error("❌ Embedding error:", error.message);
    }
}

// Run diagnostics
diagnosePinecone()
    .then(() => testEmbedding())
    .then(() => {
        console.log("\n✅ Diagnostic complete!");
        process.exit(0);
    })
    .catch(error => {
        console.error("❌ Diagnostic failed:", error);
        process.exit(1);
    });