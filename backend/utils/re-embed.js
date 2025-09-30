import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";

dotenv.config({ path: '../.env' });

// 1. Init embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

// 2. Init Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// 3. Load chunks from file
const chunks = JSON.parse(fs.readFileSync("../scripts/rag_chunks.json", "utf-8"));

console.log(`📊 Found ${chunks.length} chunks to embed`);

// 4. Convert chunks into LangChain Documents
const docs = chunks.map((chunk, i) => 
  new Document({
    pageContent: chunk.text,
    metadata: { 
      id: chunk.id || `chunk-${i}`, 
      type: chunk.type || "unknown" 
    }
  })
);

// 5. Store documents into Pinecone (without namespace)
async function embedChunks() {
  try {
    console.log('🚀 Starting to embed and store documents...');
    
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
    });

    console.log("✅ All data embedded & stored in Pinecone successfully!");
    console.log(`📈 Total documents processed: ${docs.length}`);
  } catch (error) {
    console.error('❌ Error embedding chunks:', error);
  }
}

embedChunks();