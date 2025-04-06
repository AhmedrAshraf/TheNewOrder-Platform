import React, { useState , useEffect} from 'react';
import { Search, PlusCircle, MessageCircle } from 'lucide-react';
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
  
    const channel = supabase
      .channel('realtime-unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new;
          if (msg && msg.is_read === false && msg.sender_id !== user.id) {
            setUnreadCount((prev) => prev + 1);
          }
          if (payload.eventType === 'UPDATE' && msg.is_read === true && msg.sender_id !== user.id) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  
  useEffect(() => {
    if (!user?.id) return;
  
    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('is_read', false)
        .neq('sender_id', user.id);
  
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
              {/* 3D Quantum-inspired geometric logo */}
              <div className="relative h-8 w-8">
                {/* Base layer with perspective */}
                <div className="absolute inset-0 transform-gpu rotate-45">
                  <div className="absolute inset-[15%] border-2 border-primary-600 rounded-lg transform-gpu rotate-45 bg-gradient-to-br from-white/5 to-white/20"></div>
                </div>

                {/* Middle layer with perspective */}
                <div className="absolute inset-0 transform-gpu -rotate-45">
                  <div className="absolute inset-[25%] border-2 border-secondary-500 rounded-lg transform-gpu -rotate-45 bg-gradient-to-tr from-white/10 to-white/30"></div>
                </div>

                {/* Orbital rings with 3D effect */}
                <div className="absolute inset-0">
                  {/* Horizontal ring with depth */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary-600/20 via-secondary-500 to-primary-600/20 transform -translate-y-1/2 shadow-lg"></div>
                  
                  {/* Vertical ring with depth */}
                  <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-primary-600/20 via-secondary-500 to-primary-600/20 transform -translate-x-1/2 shadow-lg"></div>
                  
                  {/* Diagonal rings with depth */}
                  <div className="absolute inset-0 transform rotate-45">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary-600/20 via-secondary-500 to-primary-600/20 transform -translate-y-1/2 shadow-lg"></div>
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-primary-600/20 via-secondary-500 to-primary-600/20 transform -translate-x-1/2 shadow-lg"></div>
                  </div>
                </div>

                {/* Quantum particles with glow */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse"></div>
                  <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-secondary-500 rounded-full transform -translate-x-1/2 translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse"></div>
                  <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse"></div>
                  <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-secondary-500 rounded-full transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse"></div>
                  
                  {/* Diagonal particles with glow */}
                  <div className="absolute inset-0 transform rotate-45">
                    <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-secondary-500 rounded-full transform -translate-x-1/2 translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-pulse"></div>
                  </div>
                </div>

                {/* Central core with glow */}
                <div className="absolute inset-[35%] bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.4)] animate-pulse"></div>
              </div>
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