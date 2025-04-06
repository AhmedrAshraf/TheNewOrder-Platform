import { useState, useEffect , useRef} from 'react';
import { Search,  ChevronLeft, Phone, Video, MoreVertical, Send, Paperclip, Smile, MessageCircle } from 'lucide-react';
import type { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState(null)
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const {user} = useAuth()
  const messagesEndRef = useRef(null);
  const currentUserId = user?.id

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
  
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchChats = async () => {
      const { data: fetchChat, error: fetchError } = await supabase
        .from('chats') 
        .select()
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
  
      if (fetchError) {
        console.error('Error fetching chats:', fetchError);
      } else {
        // Check unread messages count
        const updatedChats = await Promise.all(
          fetchChat.map(async (chat) => {
            const { data: unreadMessages } = await supabase
              .from('messages')
              .select('id')
              .eq('chat_id', chat.id)
              .eq('is_read', false);
  
            return {
              ...chat,
              unreadCount: unreadMessages?.length || 0,
            };
          })
        );
        setChats(updatedChats);
      }
    };
  
    fetchChats();
  }, [user?.id]);
  

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
  
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', selectedChat)
        .eq('is_read', false);
  
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true }); 
  
      if (messagesError) {
        console.error('Error while fetching messages:', messagesError);
      } else {
        setMessages(messagesData || []);
      }
    };
  
    fetchMessages();
  }, [selectedChat]);

  

  const getChatParticipantName = (chat: any) => {
    if (chat.buyer_id === currentUserId) {
      return chat.seller_name;
    } else if (chat.seller_id === currentUserId) {
      return chat.buyer_name;
    }
    return 'Unknown'; 
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      const currentChat = chats?.find(c => c.id === selectedChat);
      const userType = currentChat?.seller_id === user.id ? 'seller' : 'buyer';
  
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: selectedChat,
            sender_id: user.id,
            message: newMessage,
            is_read: false,
            type: userType,
          },
        ])
        .select()
        .maybeSingle();
  
      if (messagesError) {
        console.error("Error while inserting message:", messagesError);
        return;
      }
  
      console.log("Message inserted", messagesData);
      setMessages(prev => [...prev, messagesData]);
      setNewMessage('');
    } catch (error) {
      console.error("Error while inserting message:", error);
    }
  };
  

  return (
    <div className="pt-16 bg-surface-50">
      <div className="h-[calc(80vh-4rem)] flex">
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Search onClick={handleSendMessage} className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-8rem)]">
            {chats?.map((chat) => (
              <button
                key={chat?.id}
                onClick={() => setSelectedChat(chat?.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-surface-50 transition-colors ${
                  selectedChat === chat?.id ? 'bg-surface-50' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={chat?.avatar || 'https://static-00.iconduck.com/assets.00/user-avatar-1-icon-2048x2048-935gruik.png'}
                    alt="user avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat?.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center">
                      {chat?.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{getChatParticipantName(chat)}</h3>
                    <span className="text-xs text-surface-400">
                      {new Date(chat?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-surface-500 truncate">{chat?.lastMessage}</p>
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
                  src={chats.find(c => c.id === selectedChat)?.avatar || "https://static-00.iconduck.com/assets.00/user-avatar-1-icon-2048x2048-935gruik.png"}
                  alt="Chat Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium truncate">{getChatParticipantName(chats.find(c => c.id === selectedChat))}</h4>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      message.sender_id === user?.id ? 'bg-secondary-500 text-white': 'bg-surface-100'
                    }`}
                  >
                    <p >{message.message}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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