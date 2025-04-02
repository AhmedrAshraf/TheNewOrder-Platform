import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // First try to get from authState
      const savedUserData = localStorage.getItem("authState");
      if (savedUserData) {
        try {
          const parsedUser = JSON.parse(savedUserData);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (err) {
          console.error("Failed to parse saved authState:", err);
          localStorage.removeItem("authState");
        }
      }
  
      // If no authState, try to fetch from supabase
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: userRecord } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

          if(error){
            console.log("Getting error in context", error);
          }
        if (userRecord) {
          setUser(userRecord);
          localStorage.setItem("authState", JSON.stringify(userRecord));
          localStorage.setItem("userId", userRecord.id);
        }
      }
  
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("authState", JSON.stringify(user));
    }
  }, [user]);
  
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
