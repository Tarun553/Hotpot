import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function transformQuery(question, history) {
    console.log("🔄 Transforming query:", question);
    console.log("📚 History length:", history.length);
    
    history.push({
        role: 'user',
        parts: [{ text: question }]
    });
    
    try {
        const startTransform = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: history,
            config: {
                systemInstruction: `You are a query rewriting expert for Hotpot food delivery app. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
                Focus on questions about restaurants, food items, orders, delivery, and app features.
                Only output the rewritten question and nothing else.`
            },
        });
        const transformTime = Date.now() - startTransform;
        
        history.pop();
        console.log(`✅ Query transformed in ${transformTime}ms`);
        console.log("🔄 Transformed result:", response.text);
        
        return response.text;
    } catch (error) {
        console.error("❌ Query transformation failed:", error.message);
        history.pop();
        // Return original query if transformation fails
        return question;
    }
}

export const chatController = async (req, res) => {
    const history = [];
    console.log("\n" + "=".repeat(80));
    console.log("🤖 Chat endpoint hit:", new Date().toISOString());
    console.log("📝 Request body:", JSON.stringify(req.body, null, 2));
    
    try {
        const { query } = req.body;
        if (!query) {
            console.log("❌ No query provided");
            return res.status(400).json({ error: "Query required" });
        }
        
        console.log("📝 Original user query:", query);
        console.log("🔄 Starting query transformation...");

        // 1. Rewrite the query for context independence
        const rewrittenQuery = await transformQuery(query, history);
        console.log("✅ Rewritten query:", rewrittenQuery);

        // 2. Embed the rewritten query
        console.log("🔢 Creating embeddings...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });
        
        const startEmbed = Date.now();
        const queryVector = await embeddings.embedQuery(rewrittenQuery);
        const embedTime = Date.now() - startEmbed;
        console.log(`✅ Embedding created in ${embedTime}ms, vector length: ${queryVector.length}`);

        // 3. Search Pinecone for relevant context
        console.log("🔍 Searching Pinecone...");
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

        const startSearch = Date.now();
        const searchResults = await pineconeIndex.query({
            topK: 10,
            vector: queryVector,
            includeMetadata: true,
        });
        const searchTime = Date.now() - startSearch;
        console.log(`✅ Pinecone search completed in ${searchTime}ms`);
        console.log(`📊 Found ${searchResults.matches?.length || 0} matches`);

        // Process and debug search results
        console.log("🔍 Processing search results...");
        searchResults.matches?.forEach((match, index) => {
            console.log(`\n📄 Match ${index + 1}:`);
            console.log(`   Score: ${match.score?.toFixed(4) || 'N/A'}`);
            console.log(`   ID: ${match.id || 'N/A'}`);
            console.log(`   Metadata keys: ${Object.keys(match.metadata || {}).join(', ')}`);
            
            // Log available content fields
            const availableContent = {
                'metadata.pageContent': match.metadata?.pageContent ? `${match.metadata.pageContent.substring(0, 100)}...` : null,
                'pageContent': match.pageContent ? `${match.pageContent.substring(0, 100)}...` : null,
                'metadata.text': match.metadata?.text ? `${match.metadata.text.substring(0, 100)}...` : null,
                'text': match.text ? `${match.text.substring(0, 100)}...` : null,
                'metadata.content': match.metadata?.content ? `${match.metadata.content.substring(0, 100)}...` : null,
            };
            
            Object.entries(availableContent).forEach(([key, value]) => {
                if (value) {
                    console.log(`   ${key}: ${value}`);
                }
            });
        });

        const context = searchResults.matches
            .map((match, index) => {
                // Try multiple possible content fields
                const content = match.metadata?.pageContent || 
                               match.pageContent || 
                               match.metadata?.text ||
                               match.text ||
                               match.metadata?.content ||
                               "";
                
                if (content) {
                    console.log(`✅ Using content from match ${index + 1}: ${content.substring(0, 200)}...`);
                    return content;
                }
                
                console.log(`⚠️ No content found in match ${index + 1}`);
                return "";
            })
            .filter(text => text.length > 0)
            .join("\n\n---\n\n");

        console.log("\n📝 FINAL CONTEXT LENGTH:", context.length);
        console.log("📝 FINAL CONTEXT PREVIEW:");
        console.log(context.substring(0, 500) + (context.length > 500 ? "..." : ""));
        console.log("📝 CONTEXT END");
        
        if (!context || context.trim().length === 0) {
            console.log("⚠️ WARNING: No context found for query!");
        }
        // 4. Generate answer using Gemini
        console.log("🤖 Generating response with Gemini...");
        history.push({
            role: 'user',
            parts: [{ text: rewrittenQuery }]
        });

        const systemPrompt = `You are Hotpot AI, a helpful assistant for the Hotpot food delivery platform. 
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
`;

        console.log("📝 System prompt length:", systemPrompt.length);
        
        const startGenerate = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: history,
            config: {
                systemInstruction: systemPrompt
            },
        });
        const generateTime = Date.now() - startGenerate;
        
        console.log(`✅ Response generated in ${generateTime}ms`);
        console.log("🤖 AI Response:", response.text);

        history.push({
            role: 'model',
            parts: [{ text: response.text }]
        });

        console.log("✅ Chat request completed successfully");
        console.log("=".repeat(80) + "\n");
        
        res.json({ answer: response.text });
    } catch (err) {
        console.error("\n❌ CHAT ERROR DETAILS:");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Error type:", err.constructor.name);
        
        if (err.response) {
            console.error("API Response error:", {
                status: err.response.status,
                statusText: err.response.statusText,
                data: err.response.data
            });
        }
        
        console.error("=".repeat(80) + "\n");
        res.status(500).json({ error: "Internal server error" });
    }
};