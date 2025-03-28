import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronLeft, Phone, Video, MoreVertical, Send, Paperclip, Smile, MessageCircle } from 'lucide-react';
import type { ChatMessage } from '../types';

export function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  // Sample chats data
  const chats = [
    {
      id: 'chat1',
      name: 'AI Labs',
      lastMessage: 'Thanks for your interest in our AI Document Processor',
      timestamp: '2025-06-15T14:30:00Z',
      unread: true,
      avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80'
    },
    {
      id: 'chat2',
      name: 'VideoAI',
      lastMessage: 'I can help you customize the workflow',
      timestamp: '2025-06-14T09:15:00Z',
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80'
    },
    {
      id: 'chat3',
      name: 'Support AI',
      lastMessage: 'Here are the integration details you requested',
      timestamp: '2025-06-13T16:45:00Z',
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80'
    }
  ];

  // Sample messages for the selected chat
  const messages: ChatMessage[] = [
    {
      id: '1',
      senderId: 'user',
      senderName: 'You',
      receiverId: 'creator',
      content: "Hi, I'm interested in your AI Document Processor",
      timestamp: '2025-06-15T14:25:00Z',
      isRead: true,
      type: 'text'
    },
    {
      id: '2',
      senderId: 'creator',
      senderName: 'AI Labs',
      receiverId: 'user',
      content: 'Thanks for your interest! What would you like to know about it?',
      timestamp: '2025-06-15T14:30:00Z',
      isRead: true,
      type: 'text'
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message to the backend
    setNewMessage('');
  };

  return (
    <div className="min-h-screen pt-16 bg-surface-50">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-surface-200 bg-white">
          <div className="p-4 border-b border-surface-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-8rem)]">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-surface-50 transition-colors ${
                  selectedChat === chat.id ? 'bg-surface-50' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.unread && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-surface-400">
                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-surface-100 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <img
                  src={chats.find(c => c.id === selectedChat)?.avatar}
                  alt="Chat Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-medium">{chats.find(c => c.id === selectedChat)?.name}</h2>
                  <p className="text-sm text-surface-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <Phone className="h-5 w-5 text-surface-600" />
                </button>
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <Video className="h-5 w-5 text-surface-600" />
                </button>
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <MoreVertical className="h-5 w-5 text-surface-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      message.senderId === 'user'
                        ? 'bg-secondary-500 text-white'
                        : 'bg-surface-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-surface-200">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <Paperclip className="h-5 w-5 text-surface-600" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-surface-50 border border-surface-200 rounded-full py-2 px-4 focus:outline-none focus:border-secondary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button className="p-2 hover:bg-surface-100 rounded-full">
                  <Smile className="h-5 w-5 text-surface-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-surface-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-surface-400 mx-auto mb-4" />
              <p className="text-surface-600">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}