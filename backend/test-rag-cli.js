import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import readlineSync from 'readline-sync';

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

async function testRAG(query) {
    const history = [];
    
    try {
        console.log("🤖 Starting RAG test...");
        console.log("📝 Original query:", query);

        // 1. Rewrite the query for context independence
        console.log("\n🔄 Step 1: Rewriting query...");
        const rewrittenQuery = await transformQuery(query, history);
        console.log("✅ Rewritten query:", rewrittenQuery);

        // 2. Embed the rewritten query
        console.log("\n🧠 Step 2: Creating embeddings...");
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });
        const queryVector = await embeddings.embedQuery(rewrittenQuery);
        console.log("✅ Query embedded successfully");

        // 3. Search Pinecone for relevant context
        console.log("\n🔍 Step 3: Searching Pinecone...");
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

        const searchResults = await pineconeIndex.query({
            topK: 10,
            vector: queryVector,
            includeMetadata: true,
            namespace: "hotpot-rag",
        });

        console.log(`✅ Found ${searchResults.matches.length} relevant chunks`);
        
        // Log the search results for debugging
        console.log("\n📊 Search Results:");
        searchResults.matches.forEach((match, index) => {
            console.log(`${index + 1}. Score: ${match.score.toFixed(4)}`);
            console.log(`   Metadata:`, match.metadata);
            console.log(`   Content: ${(match.metadata?.pageContent || match.pageContent || "No content").substring(0, 100)}...`);
        });

        const context = searchResults.matches
            .map(match => match.metadata?.pageContent || match.pageContent || "")
            .filter(text => text.length > 0)
            .join("\n\n---\n\n");

        console.log("\n📝 Combined Context:");
        console.log(context.substring(0, 500) + "...");

        // 4. Generate answer using Gemini
        console.log("\n🎯 Step 4: Generating answer...");
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

        console.log("\n🎉 Final Answer:");
        console.log("=" * 50);
        console.log(response.text);
        console.log("=" * 50);

        return response.text;

    } catch (error) {
        console.error("❌ RAG Test Error:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
}

async function main() {
    console.log("🍲 Hotpot RAG CLI Test Tool");
    console.log("=============================");
    
    // Check environment variables
    console.log("\n🔧 Checking environment variables...");
    const requiredEnvs = ['GEMINI_API_KEY', 'PINECONE_API_KEY', 'PINECONE_INDEX_NAME'];
    const missing = requiredEnvs.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
        console.error("❌ Missing environment variables:", missing);
        console.error("Please check your .env file");
        process.exit(1);
    }
    console.log("✅ All environment variables found");
    
    while (true) {
        try {
            const userQuery = readlineSync.question("\n🤔 Ask me anything about Hotpot (or 'quit' to exit): ");
            
            if (userQuery.toLowerCase() === 'quit' || userQuery.toLowerCase() === 'exit') {
                console.log("👋 Goodbye!");
                break;
            }
            
            if (!userQuery.trim()) {
                console.log("Please enter a question!");
                continue;
            }
            
            await testRAG(userQuery);
            
        } catch (error) {
            console.error("❌ Error during RAG test:", error.message);
        }
    }
}

// Test with sample queries if run directly
if (process.argv.length > 2) {
    const testQuery = process.argv.slice(2).join(' ');
    testRAG(testQuery).catch(console.error);
} else {
    main().catch(console.error);
}