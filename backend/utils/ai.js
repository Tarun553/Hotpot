import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import dotenv from "dotenv";
import { Document } from "@langchain/core/documents";

dotenv.config({ path: '../.env' });

export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

export const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
export const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Embed & upsert chunks (supports both single chunk and array of chunks)
export async function embedAndUpsert(chunks) {
   
    
    // Handle both single chunk and array of chunks
    const chunkArray = Array.isArray(chunks) ? chunks : [chunks];
 
    
    try {
        // Process in batches to avoid memory issues
        const batchSize = 50;
        for (let i = 0; i < chunkArray.length; i += batchSize) {
            const batch = chunkArray.slice(i, i + batchSize);
            const docs = batch.map(chunk => new Document({
                pageContent: chunk.text,
                metadata: { 
                    id: chunk.id, 
                    type: chunk.type,
                    // Include additional metadata for better filtering
                    ...(chunk.shopId && { shopId: chunk.shopId }),
                    ...(chunk.shopName && { shopName: chunk.shopName }),
                    ...(chunk.itemId && { itemId: chunk.itemId }),
                    ...(chunk.itemName && { itemName: chunk.itemName }),
                    ...(chunk.category && { category: chunk.category }),
                    ...(chunk.price && { price: chunk.price }),
                    ...(chunk.foodType && { foodType: chunk.foodType }),
                    ...(chunk.city && { city: chunk.city }),
                    ...(chunk.state && { state: chunk.state })
                },
            }));

            await PineconeStore.fromDocuments(docs, embeddings, {
                pineconeIndex,
            });

            // Small delay between batches to avoid rate limits
            if (i + batchSize < chunkArray.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
      
        
    } catch (error) {
        console.error("❌ Embedding error:", error.message);
        throw error;
    }
}

