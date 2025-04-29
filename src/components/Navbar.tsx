import React, { useState , useEffect} from 'react';
import { Search, PlusCircle, MessageCircle, Layers } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { ChatInbox } from './ChatInbox';
import { NotificationCenter } from './NotificationCenter';
import type { AuthState } from '../types';
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';

interface NavbarProps {
  auth: AuthState;
  onAuthClick: () => void;
  onUploadClick: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onHome: () => void;
  onSignOut?: () => void;
}

export function Navbar({ 
  auth, 
  onAuthClick, 
  onUploadClick, 
  onSearch, 
  searchQuery, 
  onHome,
  onSignOut = () => {} 
}: NavbarProps) {
  const [showChatInbox, setShowChatInbox] = useState(false);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!user?.id) return;
  
    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('is_read', false)
        .eq('sender_id', user.id);
  
      if (!error && data) {
        setUnreadCount(data.length);
      }
      console.log(data);
    };
    
    fetchUnreadCount();
  }, [user]);

  
  return (
    <nav className="fixed top-0 w-full bg-white border-b border-surface-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={onHome} className="flex items-center gap-3">
              <Layers className="h-8 w-8 text-secondary-500" />
              <span className="text-2xl font-bold font-poppins text-surface-900">The<span className="text-secondary-500">New</span>Order</span>
            </button>
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search solutions..."
                className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500 text-surface-900"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
               <button
                onClick={onUploadClick}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-colors shadow-button hover:shadow-button-hover"
                title="Submit Solution"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Solution</span>
              </button>

              <div className="relative">
                  <button
                    onClick={() => setShowChatInbox(!showChatInbox)}
                    className="p-2 hover:bg-surface-100 rounded-lg relative"
                    title="Messages"
                  >
                    <MessageCircle className="h-5 w-5 text-surface-600" />              
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary-500 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                  </button>
                  {showChatInbox && (
                    <ChatInbox onClose={() => setShowChatInbox(false)} />
                  )}
                </div>

                <NotificationCenter user={user} />
              </>
            )}
            
            <UserDropdown 
              auth={user} 
              onSignOut={onSignOut} 
              onAuthClick={onAuthClick} 
            />
          </div>
        </div>
      </div>
    </nav>
  );
}