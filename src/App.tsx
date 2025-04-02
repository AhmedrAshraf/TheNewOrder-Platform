import { StrictMode, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { NotificationProvider } from './context/NotificationContext';
import {AuthProvider, useAuth} from "./context/AuthContext"
import { ScrollToTop } from './components/ScrollToTop';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AdminPage } from './pages/AdminPage';
import { AdminCurationPage } from './pages/AdminCurationPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminStatsPage } from './pages/AdminStatsPage';
import { AdminAddProductPage } from './pages/AdminAddProductPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { SuccessPage } from './pages/SuccessPage';
import { MessagesPage } from './pages/MessagesPage';
import { EnvCheck } from './pages/EnvCheck';
import { QuantumBackground } from './components/QuantumBackground';
import type { Product, AuthState } from './types';
import { supabase } from './lib/supabase';

const MARKETPLACE_PRODUCTS: Product[] = [
  {
    id: '4',
    title: 'Pinterest Automation Suite',
    description: 'Automate your Pinterest marketing with AI-powered pin creation, scheduling, and analytics',
    price: 499,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80',
    creator: 'Social AI Labs',
    category: 'automation',
    tags: ['pinterest', 'social-media', 'marketing'],
    priceId: 'price_1P3GVJGk9bLuwZYPeXAtXyoEgX4zJqD8MA1jU04CGJ5DTGyLU9QVOp7zt0SLqreCTJ8PRGP194TxehsLagPYKVwf00wRA7hvqq',
    pulses: 156
  },
  {
    id: '5',
    title: 'Social Content Generator',
    description: 'AI-powered content creation for all major social media platforms',
    price: 299,
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80',
    creator: 'Content AI',
    category: 'automation',
    tags: ['content', 'social-media', 'ai'],
    priceId: 'price_1P3GVJGk9bLuwZYPeXAtXyoEgX4zJqD8MA1jU04CGJ5DTGyLU9QVOp7zt0SLqreCTJ8PRGP194TxehsLagPYKVwf00wRA7hvqq',
    pulses: 243
  },
  {
    id: '6',
    title: 'AI Video Generator Pro',
    description: 'Create professional-quality videos from text prompts using advanced AI technology',
    price: 599,
    image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&q=80',
    creator: 'VideoAI Labs',
    category: 'automation',
    tags: ['video', 'content', 'ai'],
    priceId: 'price_1P3GVJGk9bLuwZYPeXAtXyoEgX4zJqD8MA1jU04CGJ5DTGyLU9QVOp7zt0SLqreCTJ8PRGP194TxehsLagPYKVwf00wRA7hvqq',
    pulses: 187
  },
  {
    id: '7',
    title: 'Email Marketing AI',
    description: 'Intelligent email marketing automation with AI-powered content generation and optimization',
    price: 399,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80',
    creator: 'MarketingAI',
    category: 'automation',
    tags: ['email', 'marketing', 'automation'],
    priceId: 'price_1P3GVJGk9bLuwZYPeXAtXyoEgX4zJqD8MA1jU04CGJ5DTGyLU9QVOp7zt0SLqreCTJ8PRGP194TxehsLagPYKVwf00wRA7hvqq',
    pulses: 165
  }
];

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [products, setProducts] = useState<Product[]>(MARKETPLACE_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<'latest' | 'popular' | 'trending'>('popular');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    console.log("auth", auth);
    
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuth(parsedAuth);
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        localStorage.removeItem('authState');
      }
    }
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
      localStorage.setItem('authState', JSON.stringify(auth));
    } else {
      localStorage.removeItem('authState');
    }
  }, [auth]);

  const handleAuth = async (name:string, email: string, password: string, isSignUp: boolean) => {
    console.log("name", name);
    
    try{
      setLoading(true)
    const isAdmin = email.includes('admin');
    console.log("isSignUp", isSignUp);
    const trimmedEmail = email.trim();
    if(isSignUp){
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
      })
      
      if(error){
        console.error("error", error);
        setError(error.message);
      }
      if (data.user === null) {
        setError("User already exists");
        return;
      }
      if(data){
        console.log("data.user?.id", data.user?.id);
        // ✅ Insert user row
        const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          name,
          email: trimmedEmail,
          role: isAdmin ? "admin" : "user"
        }]);

        if (insertError) {
        console.log("insertError", insertError);  
        setError(insertError.message || "Error while inserting user.");
        return;
        }

        // ✅ Fetch the full user row from your table
        const { data: userRecord, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();
        console.log("🚀 ~ handleAuth ~ userRecord:", userRecord)

        if (fetchError || !userRecord) {
        setError(fetchError?.message || "Unable to fetch user after signup");
        return;
        }
        setUser(userRecord);
        setAuth({isAuthenticated: true,user: userRecord,});

      }
    }else{
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) {
        setError(error.message || "Login failed");
        return;
      }
      
      // ✅ Fetch from your users table
      const { data: userRecord, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      
      if (fetchError || !userRecord) {
        setError(fetchError || "Could not find user data.");
        return;
      }
      setUser(userRecord);
      setAuth({
        isAuthenticated: true,
        user: userRecord,
      });
      
    }
    console.log("authentication works");
    
    setShowAuthModal(false);
    navigate('/dashboard');
  }catch(error){
    console.error("Error", error?.message);
    setError(error?.message)
  }finally{
    setLoading(false)
  }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if(error){
      alert("Error" + error);
    }
    setUser(null)
    localStorage.removeItem('authState');
    localStorage.removeItem('auth-storage');
    setAuth({
      isAuthenticated: false,
      user: null
    });
    navigate('/');
  };

  const handleUploadClick = () => {
    if (!auth.isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigate('/upload');
    }
  };

  const handleProfileClick = () => {
    if (auth.isAuthenticated) {
      if (auth.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const handleExploreClick = () => {
    navigate('/marketplace');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleProductSubmit = (product: Omit<Product, 'id' | 'creator' | 'pulses'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Math.random().toString(36).substr(2, 9)}`,
      creator: auth.user?.name || 'Anonymous',
      pulses: 0
    };
    setProducts([...products, newProduct]);
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <ScrollToTop />
      <QuantumBackground intensity="low" className="fixed inset-0 pointer-events-none" overlay={false} />
      
      <Navbar
        auth={auth}
        onAuthClick={handleProfileClick}
        onUploadClick={handleUploadClick}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onHome={handleHomeClick}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 relative">
        <Routes>
          <Route path="/" element={
            <>
              <Hero 
                onUploadClick={handleUploadClick} 
                onExploreClick={handleExploreClick}
                products={products}
              />
            </>
          } />
          <Route path="/upload" element={<UploadPage onSubmit={handleProductSubmit} />} />
          <Route path="/dashboard" element={<DashboardPage user={auth.user!} products={products} />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/product/:id" element={<ProductDetailPage products={products} auth={auth} />} />
          <Route path="/admin" element={<AdminPage auth={auth} />} />
          <Route path="/admin/curation" element={<AdminCurationPage auth={auth} />} />
          <Route path="/admin/users" element={<AdminUsersPage auth={auth} />} />
          <Route path="/admin/stats" element={<AdminStatsPage auth={auth} />} />
          <Route path="/admin/add-product" element={<AdminAddProductPage auth={auth} />} />
          <Route path="/settings" element={<SettingsPage user={auth.user} />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/env" element={<EnvCheck />} />
        </Routes>
      </div>

      <Footer />
      
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {setShowAuthModal(false); setError(null);}}
          onAuth={handleAuth}
          loading={loading}
          error={error}
          />
      )}

      {import.meta.env.PROD && <CookieBanner />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}