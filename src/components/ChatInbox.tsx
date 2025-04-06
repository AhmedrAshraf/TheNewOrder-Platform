import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Search, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import { useAuth } from '../context/AuthContext';
interface ChatInboxProps {
  onClose: () => void;
}

export function ChatInbox({ onClose }: ChatInboxProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const chatInboxRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<any[]>([]);
  const navigate = useNavigate();
  const {user} = useAuth()
  const currentUserId = user?.id
  useClickOutside(chatInboxRef, onClose);

  const creatorId = user?.id;

  useEffect(() => {
    if (!user?.id) return;

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats') 
        .select()
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setChats(data);
        console.log("data", data);
        
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat?.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat?.product_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleChatClick = (chatId: string, productId: string) => {
    navigate(`/messages`);
    onClose();
  };

  const handleViewAll = () => {
    navigate('/messages');
    onClose();
  };

  // Function to get the correct name to display based on the current user's role
  const getChatParticipantName = (chat: any) => {
    if (chat.buyer_id === currentUserId) {
      return chat.seller_name; // Buyer sees seller's name
    } else if (chat.seller_id === currentUserId) {
      return chat.buyer_name; // Seller sees buyer's name
    }
    return 'Unknown'; // Default to empty string if no match (shouldn't happen)
  };

  return (
    <div ref={chatInboxRef} className="absolute right-0 top-12 w-80 md:w-96 bg-red-100 rounded-xl border border-surface-200 shadow-xl z-50">
      <div className="p-4 border-b border-surface-200 flex items-center justify-between">
        <h3 className="font-semibold">Messages</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-100 rounded-full"
        >
          <X className="h-4 w-4 text-surface-400" />
        </button>
      </div>
      
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-9 focus:outline-none focus:border-secondary-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-surface-400">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-surface-500" />
            <p>No messages found</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat?.id}
              onClick={() => handleChatClick(chat?.id, chat?.solution_id)}
              className={`p-3 border-b border-surface-200 hover:bg-surface-50 cursor-pointer ${
                chat?.unread ? 'bg-surface-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <img src="https://static-00.iconduck.com/assets.00/user-avatar-1-icon-2048x2048-935gruik.png" 
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{getChatParticipantName(chat)}</h4>
                    <span className="text-xs text-surface-400 flex-shrink-0">{formatTime(chat?.created_at)}</span>
                  </div>
                  <p className="text-xs text-secondary-500 mb-1 truncate">{chat?.product_title}</p>
                  <p className="text-sm text-surface-600 truncate">{chat?.lastMessage}</p>
                </div>
                {chat?.unread && (
                  <div className="w-2 h-2 rounded-full bg-secondary-500 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 border-t border-surface-200">
        <button
          onClick={handleViewAll}
          className="w-full py-2 text-sm text-secondary-500 hover:text-secondary-600 flex items-center justify-center gap-1"
        >
          View All Messages <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
