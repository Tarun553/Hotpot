import React, { useState } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/api/chat`, 
        { query: input },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const botMessage = { role: 'bot', content: response.data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      let errorText = 'Sorry, I encountered an error. Please try again.';
      if (error.response?.status === 404) {
        errorText = `Chat service not available (404). URL: ${error.config?.url}`;
      } else if (error.response?.status === 401) {
        errorText = 'Please log in to use the chat feature.';
      } else if (error.response?.data?.error) {
        errorText = error.response.data.error;
      }
      const errorMessage = { role: 'bot', content: errorText };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 border rounded-lg bg-white shadow-lg">
      <div className="h-96 overflow-y-auto mb-4 p-4 border rounded bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
              message.role === 'user' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
              Thinking...
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about restaurants, food items, orders..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;