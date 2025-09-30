import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import readlineSync from 'readline-sync';

dotenv.config({ path: '../.env' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'text-embedding-004',
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

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

async function queryRAG(userQuestion) {
  const history = [];
  
  try {
    console.log('\n🔄 Processing your question...');
    
    // 1. Transform/rewrite query
    console.log('📝 Original question:', userQuestion);
    const rewrittenQuery = await transformQuery(userQuestion, history);
    console.log('✏️  Rewritten query:', rewrittenQuery);

    // 2. Embed the query
    console.log('\n🧠 Creating embedding...');
    const queryVector = await embeddings.embedQuery(rewrittenQuery);
    console.log('✅ Embedding created');

    // 3. Search Pinecone
    console.log('\n🔍 Searching Pinecone database...');
    const searchResults = await pineconeIndex.query({
      topK: 5,
      vector: queryVector,
      includeMetadata: true,
    });

    console.log(`📊 Found ${searchResults.matches.length} relevant results:`);
    
    // Display search results
    searchResults.matches.forEach((match, index) => {
      console.log(`\n📄 Result ${index + 1} (Score: ${match.score.toFixed(3)}):`);
      console.log(`   ID: ${match.metadata?.id || match.id || 'N/A'}`);
      console.log(`   Type: ${match.metadata?.type || 'N/A'}`);
      
      // Try different ways to get content
      const content = match.metadata?.pageContent || 
                     match.pageContent || 
                     match.metadata?.text ||
                     match.text ||
                     JSON.stringify(match.metadata) ||
                     'N/A';
      console.log(`   Content: ${content}`);
      console.log(`   Raw metadata:`, match.metadata);
    });

    // 4. Prepare context
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
      
    console.log('\n📝 Context content:', context || 'No context found');

    console.log('\n📚 Context prepared for AI generation');

    // 5. Generate answer
    console.log('\n🤖 Generating answer with Gemini...');
    
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

    console.log('\n🎯 Final Answer:');
    console.log('=' .repeat(50));
    console.log(response.text);
    console.log('=' .repeat(50));

    return response.text;

  } catch (error) {
    console.error('\n❌ Error in RAG pipeline:', error);
    return 'Sorry, I encountered an error processing your question.';
  }
}

async function main() {
  console.log('🍲 Welcome to Hotpot RAG CLI Test!');
  console.log('Ask questions about restaurants, food items, or the app.');
  console.log('Type "exit" to quit.\n');

  while (true) {
    const userQuestion = readlineSync.question('💬 Your question: ');
    
    if (userQuestion.toLowerCase() === 'exit') {
      console.log('👋 Goodbye!');
      break;
    }

    if (!userQuestion.trim()) {
      console.log('⚠️  Please enter a question.');
      continue;
    }

    await queryRAG(userQuestion);
    console.log('\n' + '-'.repeat(60) + '\n');
  }
}

// Test with some sample questions if no readline interaction
async function runTests() {
  console.log('🧪 Running sample tests...\n');
  
  const testQuestions = [
    "What restaurants are available in Bhopal?",
    "Show me pizza options",
    "What's the price of items at lotpot?",
    "Which restaurants serve vegetarian food?"
  ];

  for (const question of testQuestions) {
    console.log(`\n🧪 Testing: "${question}"`);
    await queryRAG(question);
    console.log('\n' + '='.repeat(80));
  }
}

// Check if running interactively or as test
if (process.argv.includes('--test')) {
  runTests();
} else {
  main();
}