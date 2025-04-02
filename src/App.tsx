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
  const [auth, setAuth] = useState<AuthState>(null);
  const { setUser , user} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedAuth = localStorage.getItem('authState');
    
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth); 
        setAuth(parsedAuth); 
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
      }
    }
  }, []);
  

  const handleSignOut = async () => {
    console.log("user is logged out");
    const { error } = await supabase.auth.signOut()
    if(error){
      alert("Error" + error);
    }
    setUser(null)
    localStorage.removeItem('authState');
    localStorage.removeItem('userId');
    window.location.href = '/'
  };

  const handleUploadClick = () => {
    if (!auth) {
      setShowAuthModal(true);
    } else {
      navigate('/upload');
    }
  };

  const handleProfileClick = () => {
    if (auth) {
      if (auth?.role === 'admin') {
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
      creator: auth?.name || 'Anonymous',
      pulses: 0
    };
    setProducts([...products, newProduct]);
    navigate('/marketplace');
  };


  useEffect(()=>{
    console.log(auth);
  })

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <ScrollToTop />
      <QuantumBackground intensity="low" className="fixed inset-0 pointer-events-none" overlay={false} />
      
      <Navbar
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
          <Route path="/dashboard" element={<DashboardPage products={products} />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/product/:id" element={<ProductDetailPage products={products}/>} />
          <Route path="/admin" element={<AdminPage/>} />
          <Route path="/admin/curation" element={<AdminCurationPage/>} />
          <Route path="/admin/users" element={<AdminUsersPage/>} />
          <Route path="/admin/stats" element={<AdminStatsPage/>} />
          <Route path="/admin/add-product" element={<AdminAddProductPage/>} />
          <Route path="/settings" element={<SettingsPage />} />
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
          onClose={() => {setShowAuthModal(false)}}
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