import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, LogIn, UserPlus, Shield, HelpCircle , Wallet } from 'lucide-react';
import type { AuthState } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserDropdownProps {
  auth: AuthState;
  onSignOut: () => void;
  onAuthClick: () => void;
}

export function UserDropdown({onSignOut, onAuthClick }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {user} = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    onSignOut();
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {!user ? (
      <button
        onClick={toggleDropdown}
        className="px-6 py-3 bg-gradient-to-r flex gap-3 capitalize from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        title={user ? 'Account' : 'Sign In'}
      >
        <User className="h-5 w-5" />Get started
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full border-2 border-white"></span>
      </button>
        ):(
      <button
        onClick={toggleDropdown}
        className="p-2 hover:bg-surface-100 rounded-lg group relative"
        title={user ? 'Account' : 'Sign In'}
      >
        <User className="h-5 w-5 text-surface-600" />
        {user && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full border-2 border-white"></span>
        )}
      </button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-surface-200 shadow-xl z-50 overflow-hidden">
          {user ? (
            <>
              <div className="p-4 bg-gradient-to-r from-primary-600 to-secondary-500">
                <div className="flex items-center space-x-3">
                  <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-secondary-500 font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-sm text-white/80">{user?.email}</p>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="mt-2 flex items-center">
                    <Shield className="h-4 w-4 text-white/80 mr-1" />
                    <span className="text-xs text-white/80">Admin</span>
                  </div>
                )}
              </div>
              <div className="py-2">
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3"
                 >
                  <User className="h-4 w-4 text-surface-400" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleNavigation('/managePayouts')}
                  className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3"
                 >
                  <Wallet  className="h-4 w-4 text-surface-400" />
                  <span>Payout Management</span>
                </button>
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3"
                >
                  <Settings className="h-4 w-4 text-surface-400" />
                  <span>Settings</span>
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3"
                  >
                    <Shield className="h-4 w-4 text-surface-400" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <div className="border-t border-surface-200 my-2"></div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3 text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-2">
              <button
                onClick={onAuthClick}
                className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3"
              >
                <LogIn className="h-4 w-4 text-surface-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={onAuthClick}
                className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3"
              >
                <UserPlus className="h-4 w-4 text-surface-400" />
                <span>Create Account</span>
              </button>
              <div className="border-t border-surface-200 my-2"></div>
              <button
                onClick={() => handleNavigation('/help')}
                className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center space-x-3"
              >
                <HelpCircle className="h-4 w-4 text-surface-400" />
                <span>Help & Support</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}