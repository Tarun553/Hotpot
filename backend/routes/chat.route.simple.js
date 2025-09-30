import express from "express";

const router = express.Router();

// Simple test controller without AI dependencies
const simpleTestController = (req, res) => {
  console.log("🤖 Simple chat test hit:", req.body);
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });
    
    res.json({ 
      answer: `Hello! You asked: "${query}". This is a test response from Hotpot AI. The full RAG system will be connected soon!`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Simple chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Chat route is working!" });
});

// Simple POST route for testing
router.post("/", simpleTestController);

export default router;