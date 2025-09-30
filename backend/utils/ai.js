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

// Embed & upsert a single chunk
export async function embedAndUpsert(chunk) {
  const doc = new Document({
    pageContent: chunk.text,
    metadata: { id: chunk.id, type: chunk.type },
  });

  await PineconeStore.fromDocuments([doc], embeddings, {
    pineconeIndex,
  });

  console.log("✅ Embedded:", chunk.id);
}

