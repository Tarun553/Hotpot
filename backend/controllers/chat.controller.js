import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function transformQuery(question, history) {
    history.push({
        role: 'user',
        parts: [{ text: question }]
    });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        config: {
            systemInstruction: `You are a query rewriting expert for Hotpot food delivery app. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
            Focus on questions about restaurants, food items, orders, delivery, and app features.
            Only output the rewritten question and nothing else.`
        },
    });
    
    history.pop();
    return response.text;
}

export const chatController = async (req, res) => {
    const history = [];
    console.log("🤖 Chat endpoint hit:", req.body);
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query required" });
        console.log("📝 User query:", query);

        // 1. Rewrite the query for context independence
        const rewrittenQuery = await transformQuery(query, history);

    // 2. Embed the rewritten query
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004',
    });
    const queryVector = await embeddings.embedQuery(rewrittenQuery);

    // 3. Search Pinecone for relevant context
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true,
    });

    const context = searchResults.matches
      .map(match => {
        return match.metadata?.pageContent || 
               match.pageContent || 
               match.metadata?.text ||
               match.text ||
               "";
      })
      .filter(text => text.length > 0)
      .join("\n\n---\n\n");

    // 4. Generate answer using Gemini
    history.push({
      role: 'user',
      parts: [{ text: rewrittenQuery }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: history,
      config: {
        systemInstruction: `You are Hotpot AI, a helpful assistant for the Hotpot food delivery platform. 
You help users find restaurants, food items, place orders, track deliveries, and answer questions about the app.

About Hotpot:
- A food delivery platform connecting customers, restaurant owners, and delivery partners
- Users can browse restaurants by location and category
- Restaurant owners can manage their shops and menu items  
- Delivery partners can accept and complete delivery assignments
- Features: real-time tracking, multiple payment options, ratings & reviews

Your task is to answer user questions based ONLY on the provided context from the Hotpot database.
If the answer is not in the context, say "I don't have that information in my database. Please contact support for help."

Be friendly, helpful, and focus on food delivery, restaurants, orders, and app features.
Keep answers clear and concise.

Context from Hotpot database:
${context}
`
      },
    });

    history.push({
      role: 'model',
      parts: [{ text: response.text }]
    });

    res.json({ answer: response.text });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};