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

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<'latest' | 'popular' | 'trending'>('popular');
  const { user, setUser } = useAuth();
  const navigate = useNavigate();


  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if(error){
        alert("Error" + error);
      }
      setUser(null)
      localStorage.removeItem('authState');
      localStorage.removeItem('userId');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate('/upload');
    }
  };

  const handleProfileClick = () => {
    if (user) {
      if (user?.role === 'admin') {
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


  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <ScrollToTop />
      {/* <QuantumBackground intensity="low" className="fixed inset-0 pointer-events-none" overlay={false} /> */}
      
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
              />
            </>
          } />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage/>} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
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
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}