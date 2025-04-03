import React, { useState, useRef, useEffect } from "react";
import { X, Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { QuantumBackground } from "./QuantumBackground";
import { useClickOutside } from "../hooks/useClickOutside";
import {useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {useAuth} from "../context/AuthContext"
import type {AuthState } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (name: string, email: string, password: string, isSignUp: boolean) => void;
  loading: boolean;
  error: string
}

export function AuthModal({
  isOpen,
  onClose,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const modalRef: any = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useClickOutside(modalRef, onClose);
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuth(name, email, password, isSignUp);
  };  

  // const handleAuth = async (name:string, email: string, password: string, isSignUp: boolean) => {
  //     console.log("name", name);
      
  //     try{
  //       setLoading(true)
  //     const isAdmin = email.includes('admin');
  //     console.log("isSignUp", isSignUp);
  //     const trimmedEmail = email.trim();
  //     if(isSignUp){
  //       const { data, error } = await supabase.auth.signUp({
  //         email: trimmedEmail,
  //         password: password,
  //       })
        
  //       if(error){
  //         console.error("error", error);
  //         setError(error.message);
  //       }
  //       if (data.user === null) {
  //         setError("User already exists");
  //         return;
  //       }
  //       if(data){
  //         console.log("data.user?.id", data.user?.id);
  //         // ✅ Insert user row
  //         const { error: insertError } = await supabase
  //         .from('users')
  //         .insert([{
  //           id: data.user.id,
  //           name,
  //           email: trimmedEmail,
  //           role: isAdmin ? "admin" : "user"
  //         }]);
  
  //         if (insertError) {
  //         console.log("insertError", insertError);  
  //         setError(insertError.message || "Error while inserting user.");
  //         return;
  //         }
  //         // localStorage.setItem('authState', JSON.stringify(userRecord));
  //         localStorage.setItem('userId', data.user.id);
  //       }
  //     }else{
  //       const { data, error } = await supabase.auth.signInWithPassword({
  //         email: trimmedEmail,
  //         password,
  //       });
  //       if (error) {
  //         setError(error.message || "Login failed");
  //         return;
  //       }
  //       // localStorage.setItem('authState', JSON.stringify(userTableData));
  //       localStorage.setItem('userId', data.user.id);
  //     }
  //     console.log("authentication works");
  //     onClose()
  //     navigate('/dashboard');
  //   }catch(error: any){
  //     console.error("Error", error?.message);
  //     setError(error?.message)
  //   }finally{
  //     setLoading(false)
  //   }
  //   };
  

  const handleAuth = async (name:string, email: string, password: string, isSignUp: boolean) => {
    try {
      setLoading(true)
      const isAdmin = email.includes('admin');
      const trimmedEmail = email.trim();
      
      if(isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
        })
        
        if(error) {
          setError(error.message);
          return;
        }
        if (data.user === null) {
          setError("User already exists");
          return;
        }
        
        // Insert user row
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            name,
            email: trimmedEmail,
            role: isAdmin ? "admin" : "user"
          }]);
  
        if (insertError) {
          setError(insertError.message || "Error while inserting user.");
          return;
        }
  
        // Fetch the newly created user
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
  
        if (userData) {
          setUser(userData); // This updates the auth context
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('authState', JSON.stringify(userData));
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        
        if (error) {
          setError(error.message || "Login failed");
          return;
        }
  
        // Fetch user data after login
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
  
        if (userData) {
          setUser(userData); // This updates the auth context
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('authState', JSON.stringify(userData));
        }
      }
      
      onClose()
      navigate('/dashboard');
    } catch(error: any) {
      setError(error?.message)
    } finally {
      setLoading(false)
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={modalRef} className="relative w-full max-w-md mx-4">
        {/* Background Effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <QuantumBackground
            intensity="low"
            className="opacity-10"
            overlay={false}
          />
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
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-surface-600 mt-2">
              {isSignUp
                ? "Join our community of AI innovators"
                : "Sign in to access your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field removed as it is not required */}
            {error && <p className="text-red-500 bg-red-50 rounded-lg p-4 text-center mt-2 text-sm">Error: {error}</p>}
            {isSignUp && (
              <div>
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
                {/* <div className="mt-3">
                  <label className="block text-sm font-medium mb-2 text-surface-700">Role</label>
                  <div className="p-2 border rounded-xl">
                      <select name="role" id="role">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                  </div>
                </div> */}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-surface-700">
                Email
              </label>
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
              <label className="block text-sm font-medium mb-2 text-surface-700">
                Password
              </label>
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Processing...
                </>
              ) : isSignUp ? (
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
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-surface-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-surface-500">or</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-surface-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
