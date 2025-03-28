import React, { useState } from 'react';
import { Star, Share2, Loader2, Zap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onCardClick: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export function ProductCard({ product, onCardClick }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      setError(null);

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Could not initialize Stripe. Please check your API key.');
      }

      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: product.price,
          title: product.title,
          description: product.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPulses = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div 
      className="bg-secondary-500 rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer h-full flex flex-col"
      onClick={onCardClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1 bg-black/20 text-white text-xs rounded-full">
            {product.category}
          </span>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 hover:bg-black/20 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">{product.title}</h3>
        <p className="text-sm text-white/80 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">{formatPulses(product.pulses)}</span>
            </div>
            <span className="text-sm text-white/80">by {product.creator}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">${product.price}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCardClick();
              }}
              disabled={isLoading}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white text-sm rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'See More'
              )}
            </button>
          </div>
          
          {error && (
            <p className="text-red-200 text-sm text-center bg-red-500/20 p-2 rounded-lg mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}