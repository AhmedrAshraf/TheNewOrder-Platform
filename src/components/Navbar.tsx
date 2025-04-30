import React, { useState , useEffect} from 'react';
import { Search, PlusCircle, MessageCircle, Layers, Menu, X, User as UserIcon, Wallet, Settings, LogOut, LogIn, Shield, Filter, BarChart3 } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { ChatInbox } from './ChatInbox';
import { NotificationCenter } from './NotificationCenter';
import type { AuthState, User } from '../types';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    };
    
    fetchUnreadCount();
  }, [user]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const currentUser: User | null = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    products: [],
    role: user.role as 'user' | 'admin' | undefined
  } : null;
  
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

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
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

          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
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

                <NotificationCenter user={currentUser} />
              </>
            )}
            
            <UserDropdown 
              auth={currentUser ? { isAuthenticated: true, user: currentUser } : { isAuthenticated: false, user: null }} 
              onSignOut={onSignOut} 
              onAuthClick={onAuthClick} 
            />
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-surface-100 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-surface-600" />
              ) : (
                <Menu className="h-6 w-6 text-surface-600" />
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden my-2">
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
      </div>

      <div className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white transform transition-transform duration-300 ease-in-out z-50 shadow-lg ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-surface-100 rounded-lg"
            >
              <X className="h-6 w-6 text-surface-600" />
            </button>
          </div>
          
          <div className="flex flex-col space-y-4">
            {currentUser && (
              <>
                <button
                  onClick={() => {
                    onUploadClick();
                    toggleMobileMenu();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-colors shadow-button hover:shadow-button-hover"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Submit Solution</span>
                </button>

                <button
                  onClick={() => {
                    setShowChatInbox(!showChatInbox);
                    toggleMobileMenu();
                  }}
                  className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                >
                  <MessageCircle className="h-5 w-5 text-surface-600" />
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="bg-secondary-500 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center space-x-2 py-2 hover:bg-surface-100 rounded-lg">
                  <NotificationCenter user={currentUser} />
                  <span>Notifications</span>
                </div>

                <div className="border-t border-surface-200 pt-4">
                  <div className="flex flex-col space-y-2">
                    {currentUser?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => {
                            window.location.href = '/admin';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <Shield className="h-4 w-4 text-surface-400" />
                          <span>Admin Panel</span>
                        </button>
                        <button 
                          onClick={() => {
                            window.location.href = '/admin/curation';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <Filter className="h-4 w-4 text-surface-400" />
                          <span>Solution Curation</span>
                        </button>
                        <button 
                          onClick={() => {
                            window.location.href = '/admin/add-product';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <PlusCircle className="h-4 w-4 text-surface-400" />
                          <span>Add New Solution</span>
                        </button>
                        <button 
                          onClick={() => {
                            window.location.href = '/admin/users';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <UserIcon className="h-4 w-4 text-surface-400" />
                          <span>User Management</span>
                        </button>
                        <button 
                          onClick={() => {
                            window.location.href = '/admin/stats';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <BarChart3 className="h-4 w-4 text-surface-400" />
                          <span>Statistics</span>
                        </button>
                        <div className="border-t border-surface-200 my-2"></div>
                      </>
                    )}
                    {currentUser ? (
                      <>
                        <button 
                          onClick={() => {
                            window.location.href = '/dashboard';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <UserIcon className="h-4 w-4 text-surface-400" />
                          <span>Dashboard</span>
                        </button>
                        <button 
                          onClick={() => {
                            window.location.href = '/managePayouts';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <Wallet className="h-4 w-4 text-surface-400" />
                          <span>Payout Management</span>
                        </button>
                        <button 
                          onClick={() => {
                            window.location.href = '/settings';
                            toggleMobileMenu();
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-surface-100 rounded-lg"
                        >
                          <Settings className="h-4 w-4 text-surface-400" />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-surface-200 my-2"></div>
                        <button 
                          onClick={onSignOut}
                          className="flex items-center space-x-2 p-2 text-red-500 hover:bg-surface-100 rounded-lg"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={onAuthClick}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-colors shadow-button hover:shadow-button-hover"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {!currentUser && (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-colors shadow-button hover:shadow-button-hover"
              >
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </nav>
  );
}