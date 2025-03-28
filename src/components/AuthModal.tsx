import React, { useState, useRef } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { QuantumBackground } from './QuantumBackground';
import { useClickOutside } from '../hooks/useClickOutside';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (email: string, password: string, isSignUp: boolean) => void;
}

export function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth(email, password, isSignUp);
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={modalRef} className="relative w-full max-w-md mx-4">
        {/* Background Effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <QuantumBackground intensity="low" className="opacity-10" overlay={false} />
        </div>

        {/* Modal Content */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl border border-surface-200 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-surface-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-surface-400" />
          </button>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-poppins bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-surface-600 mt-2">
              {isSignUp 
                ? 'Join our community of AI innovators'
                : 'Sign in to access your account'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2 text-surface-700">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 placeholder-surface-400 transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2 text-surface-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 placeholder-surface-400 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <p className="text-xs text-surface-500 mt-1">
                Use an email with "admin" to access the admin panel
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-surface-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 placeholder-surface-400 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="relative mt-8 pt-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-surface-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-surface-500">or</span>
            </div>
          </div>
          
          <p className="mt-6 text-center text-sm text-surface-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}