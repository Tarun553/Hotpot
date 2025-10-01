import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, MessageCircle, Send, Bot, User, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "👋 Hi! I'm Hotpot AI Assistant. I can help you find restaurants, food items, track orders, and answer any questions about our platform!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

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
      
      // Add unread count if chat is closed or minimized
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorText = 'Sorry, I encountered an error. Please try again.';
      if (error.response?.status === 404) {
        errorText = 'Chat service temporarily unavailable. Please try again later.';
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

  const quickActions = [
    "Show me popular restaurants",
    "What's trending today?",
    "Track my recent order",
    "Find pizza near me"
  ];

  const handleQuickAction = (action) => {
    setInput(action);
    // Auto-send after a brief delay
    setTimeout(() => {
      const event = { preventDefault: () => {} };
      sendMessage(event);
    }, 100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget */}
      {isOpen && (
        <Card className={`mb-4 transition-all duration-300 ease-in-out shadow-2xl border-orange-200 ${
          isMinimized ? 'w-80 h-16' : 'w-80 h-[500px] sm:w-96 sm:h-[600px]'
        }`}>
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Hotpot Assistant</h3>
                  <p className="text-xs text-orange-100">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isMinimized ? maximizeChat : minimizeChat}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Chat Content - Hidden when minimized */}
          {!isMinimized && (
            <>
              <CardContent className="p-0 flex flex-col h-[400px] sm:h-[480px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-white border-2 border-orange-200'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        message.role === 'user'
                          ? 'bg-orange-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <div className="p-3 bg-white border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-1">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="text-xs h-7 px-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </>
        )}
      </Button>
    </div>
  );
};

export default FloatingChatWidget;