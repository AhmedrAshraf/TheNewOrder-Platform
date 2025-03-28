import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield, Layers, Rocket, Code, Bot, Cpu, Lock, Clock, Award, Users, Search, X, TrendingUp } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { QuantumBackground } from './QuantumBackground';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';

interface HeroProps {
  onUploadClick: () => void;
  onExploreClick: () => void;
  products: Product[];
}

export function Hero({ onUploadClick, onExploreClick, products }: HeroProps) {
  const [filterOption, setFilterOption] = useState<'latest' | 'popular' | 'trending'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();

  // Shorter, focused search suggestions
  const searchPlaceholders = [
    "Generate social media content...",
    "Create email marketing campaigns...",
    "Analyze customer feedback data...",
    "Generate SEO product descriptions...",
    "Extract data from documents...",
    "Create personalized videos...",
    "Monitor customer support chats..."
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentPlaceholder = searchPlaceholders[placeholderIndex];

    if (isTyping) {
      if (typedPlaceholder.length < currentPlaceholder.length) {
        timeout = setTimeout(() => {
          setTypedPlaceholder(currentPlaceholder.slice(0, typedPlaceholder.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (typedPlaceholder.length > 0) {
        timeout = setTimeout(() => {
          setTypedPlaceholder(typedPlaceholder.slice(0, -1));
        }, 30);
      } else {
        timeout = setTimeout(() => {
          setPlaceholderIndex((current) => (current + 1) % searchPlaceholders.length);
          setIsTyping(true);
        }, 500);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedPlaceholder, isTyping, placeholderIndex, searchPlaceholders]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <div className="relative overflow-hidden bg-white mt-16 md:mt-20">
        <div className="absolute inset-0 h-[92%]">
          <QuantumBackground intensity="high" overlay={true} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Layers className="h-12 w-12 text-secondary-500" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-surface-900 mb-4 font-poppins">
              AI Agent & Workflow Marketplace for
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                {" "}Marketing teams
              </span>
            </h1>
            <p className="text-lg text-surface-600 mb-8 max-w-2xl mx-auto">
              Triple your marketing output with proven AI agents and workflows
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={typedPlaceholder}
                  className="w-full bg-white/90 backdrop-blur-sm border border-surface-200 rounded-xl py-4 px-6 pl-12 text-lg focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 shadow-lg placeholder:text-surface-400"
                />
                <Search className="absolute left-4 top-4 h-6 w-6 text-surface-400" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-4 text-surface-400 hover:text-surface-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button 
                onClick={onExploreClick}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                Explore Marketplace
              </button>
              <button
                onClick={onUploadClick}
                className="px-6 py-3 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg transition-colors"
              >
                Submit Your Solution
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Automations</h2>
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 ${filterOption === 'latest' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900'} rounded-lg`}
                onClick={() => setFilterOption('latest')}
              >
                Latest
              </button>
              <button 
                className={`px-4 py-2 ${filterOption === 'popular' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900'} rounded-lg`}
                onClick={() => setFilterOption('popular')}
              >
                Popular
              </button>
              <button 
                className={`px-4 py-2 ${filterOption === 'trending' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900'} rounded-lg`}
                onClick={() => setFilterOption('trending')}
              >
                Trending
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onCardClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get started with The New Order in four simple steps</h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              Get started with The New Order in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 h-full min-h-[280px] flex flex-col">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Select</h3>
                <p className="text-surface-600 flex-1">
                  Browse our curated marketplace of AI tools and automations to find the solution for your usecase
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 h-full min-h-[280px] flex flex-col">
                <div className="bg-secondary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-secondary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Integrate</h3>
                <p className="text-surface-600 flex-1">
                  Seamlessly integrate AI and tools into your existing workflow
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 h-full min-h-[280px] flex flex-col">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Automate</h3>
                <p className="text-surface-600 flex-1">
                  Let AI handle repetitive tasks while you focus on growth
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 h-full min-h-[280px] flex flex-col">
                <div className="bg-secondary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-secondary-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">4. Scale</h3>
                <p className="text-surface-600 flex-1">
                  Scale your marketing output and results with solutions from our platform experts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose The New Order</h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              The trusted platform for enterprise-grade AI solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-primary-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Curated AI solution marketplace</h3>
              <p className="text-surface-600">
                Every tool is built by vetted AI specialists and experts
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-secondary-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-secondary-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Secure</h3>
              <p className="text-surface-600">
                Bank-grade security and data protection standards
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-primary-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Available support</h3>
              <p className="text-surface-600">
                Round-the-clock technical support and assistance
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-secondary-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-secondary-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Assured</h3>
              <p className="text-surface-600">
                Rigorous testing and validation process
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-surface-50 p-8 rounded-xl">
              <div className="flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary-500 mr-2" />
                <h3 className="text-2xl font-bold">Join Our Growing Community</h3>
              </div>
              <p className="text-lg text-surface-600 mb-8 max-w-2xl mx-auto">
                Connect with AI experts, developers, and businesses building the future of automation
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-500">10,000+</p>
                  <p className="text-surface-600">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-500">500+</p>
                  <p className="text-surface-600">AI Tools</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-500">98%</p>
                  <p className="text-surface-600">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}