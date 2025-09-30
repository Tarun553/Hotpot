import React from 'react'
import ChatBot from '../components/ChatBot'

const ChatBotPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍲 Hotpot AI Assistant</h1>
          <p className="text-gray-600 text-lg">
            Ask me about restaurants, food items, orders, or anything about Hotpot!
          </p>
        </div>
        <ChatBot/>
      </div>
    </div>
  )
}

export default ChatBotPage