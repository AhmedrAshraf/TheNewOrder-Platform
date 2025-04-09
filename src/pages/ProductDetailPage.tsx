import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Share2, Zap, ArrowLeft, Tag, User, Calendar, Download, Shield, Loader2, 
  Code, Database, Server, Globe, Clock, Video, MessageCircle, ChevronDown, ChevronUp,
  CheckCircle, AlertTriangle, Cpu, Star, MessageSquare
} from 'lucide-react';
import { ChatModal } from '../components/ChatModal';
import type { Product, AuthState, ConsultationOption } from '../types';
import {useAuth} from "../context/AuthContext"
import { supabase } from '../lib/supabase';
import { AuthModal } from '../components/AuthModal';
import axios from 'axios';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'howto' | 'faq' | 'reviews'>('overview');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [faqItems, setFaqItems] = useState([])
  const [showAuthModal ,setShowAuthModal] = useState(false)
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const {user} = useAuth()
  
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('solution_id', id)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error("Error fetching reviews:", error);
      return;
    }
    setReviews(data || []);
  };
  
  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };
  
  const handleSubmitReview = async () => {
    if (!user || !rating) return;
    
    setIsSubmittingReview(true);
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          solution_id: id,
          user_id: user.id,
          rating,
          comment,
          user_name: user?.name
        }]);
      
      if (error) throw error;
      console.log(data);
      
      await fetchReviews();
      setComment('');
      setRating(0);
      
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };


  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error) {
        console.error("Error fetching product:", error);
        setError('Failed to load product');
        return;
      }
      fetchReviews();
      setProduct(data);
      setFaqItems(data?.faq || []);
    };
  
    fetchProduct();
  }, [id]);

  console.log(product?.user_id);
  const handlePurchase = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    } else {
      console.log("working");
      try {
        setIsLoading(true)
        // const response = await axios.post('http://localhost:8000/api/create-checkout-session', {
        const response = await axios.post('https://the-new-order-platform-server.vercel.app/api/create-checkout-session', {
          uid: user?.id,
          totalprice: product?.price,
          customerEmail: user?.email,
          solution_id: product?.id,
          sellerId: product?.user_id,
          solution: product
        },{ headers: {
          'Content-Type': 'application/json',
        }}
      );
        
        console.log("🚀 ~ handlePurchase ~ response:", response);
        if (response.status === 200) {
          const { session } = response.data;
          window.location.href = session.url;
        }
      } catch (error) {
        console.error("Error during purchase:", error);
      }finally{
        setIsLoading(true)
      }
    }
  };
  

  const handlePulse = async() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (product && !hasPulsed) {
      // Update the product's pulse count in the database
      const { error } = await supabase
        .from('solutions')
        .update({ pulses: product.pulses + 1 })
        .eq('id', product.id);
      if (error) {
        console.error("Error updating pulse count:", error);
        setError('Failed to update pulse count');
        return;
      }

      // Update the local state
      setProduct({
        ...product,
        pulses: product.pulses + 1
      });
      setHasPulsed(true);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleBookConsultation = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setShowChatModal(true);
  };

  if (!product) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-secondary-500" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }
  const consultationOptions: ConsultationOption[] = [
    {
      id: "setup",
      title: "I need help setting this up",
      description: "Get assistance with installation and configuration"
    },
    {
      id: "troubleshoot",
      title: "I need help troubleshooting",
      description: "Resolve issues with your existing implementation"
    },
    {
      id: "customize",
      title: "I want your help customizing this flow",
      description: "Adapt the workflow to your specific needs"
    }
  ];

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl overflow-hidden border border-surface-200 shadow-card">
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="p-4 bg-black/50 hover:bg-black/70 rounded-full transition-colors">
                    <Video className="h-8 w-8 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="border-b border-surface-200">
                <div className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${
                      activeTab === 'overview' 
                        ? 'border-b-2 border-secondary-500 text-surface-900' 
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('howto')}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${
                      activeTab === 'howto' 
                        ? 'border-b-2 border-secondary-500 text-surface-900' 
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    How to Make it Work
                  </button>
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${
                      activeTab === 'faq' 
                        ? 'border-b-2 border-secondary-500 text-surface-900' 
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    FAQ
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-4 font-medium whitespace-nowrap ${
                      activeTab === 'reviews' 
                        ? 'border-b-2 border-secondary-500 text-surface-900' 
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    Reviews
                  </button>
                </div>
              </div>

              {activeTab === 'reviews' && (
                <div className="space-y-4 p-4">
                  <h2 className="text-xl font-semibold mb-4 text-surface-900">Customer Reviews</h2>
                  
                  {/* Review form (only for logged in users) */}
                  {user && (
                    <div className="bg-surface-50 p-4 rounded-lg mb-6">
                      <h3 className="font-medium mb-3">Write a Review</h3>
                      <div className="flex mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            onClick={() => handleStarClick(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-surface-300'}`}
                              fill={star <= rating ? 'currentColor' : 'none'}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea 
                        className="w-full p-3 border border-surface-200 rounded-lg mb-3"
                        placeholder="Share your experience with this product..."
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <button 
                        onClick={handleSubmitReview}
                        disabled={!rating || isSubmittingReview}
                        className={`bg-secondary-500 text-white px-4 py-2 rounded-lg ${
                          !rating || isSubmittingReview ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  )}
                  
                  {/* Reviews list */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-surface-500">No reviews yet. Be the first to review!</p>
                    ) : (
                      reviews.map((review) => (
                        console.log("review", review),
                        
                        <div key={review.id} className="border-b border-surface-200 pb-4 p-2">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
                              {review.user_name || review.user?.email || 'Anonymous'}
                            </h4>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-surface-300'}`}
                                  fill={star <= review.rating ? 'currentColor' : 'none'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-surface-600 text-sm mb-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-surface-700">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-surface-900">{product.title}</h1>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handlePulse}
                      disabled={!user || hasPulsed}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        hasPulsed 
                          ? 'bg-secondary-100 text-secondary-700 border border-secondary-200' 
                          : user 
                            ? 'bg-surface-100 hover:bg-surface-200 text-surface-900 border border-surface-200' 
                            : 'bg-surface-100 text-surface-400 cursor-not-allowed'
                      }`}
                      title={!user ? "Login to give a pulse" : hasPulsed ? "Already pulsed" : "Give a pulse"}
                    >
                      <Zap className={`h-5 w-5 ${hasPulsed ? 'text-secondary-500' : ''}`} />
                      <span>{hasPulsed ? "Pulsed!" : "Pulse"}</span>
                    </button>
                    <button className="p-2 bg-surface-100 hover:bg-surface-200 rounded-full">
                      <Share2 className="h-5 w-5 text-surface-600" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-surface-400" />
                    <span className="text-surface-600">{product.creator?.creator_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-surface-400" />
                    <span className="text-surface-600">{product.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-surface-400" />
                    <span className="text-surface-600">Added June 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-secondary-500" />
                    <span className="text-surface-600">{product.pulses} pulses</span>
                  </div>
                </div>
                
                {activeTab === 'overview' && (
                  <>
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-3 text-surface-900">Description</h2>
                      <p className="text-surface-600 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-3 text-surface-900">Key Features</h2>
                      {product.key_features && product.key_features.length > 0 ? (
                        <div className="">
                          {product.key_features.map((feature, index) => (
                            <ul key={index} className="rounded-lg px-4">
                              <li className="text-surface-600 list-disc">{feature}</li>
                            </ul>
                          ))}
                        </div>
                      ) : (
                        <p className="text-surface-600 italic">No key features specified.</p>
                      )}
                    </div>
                    
                    {product?.demoVideo && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-3 text-surface-900">Demo Video</h2>
                      <div className="aspect-video bg-surface-100 rounded-lg flex items-center justify-center">
                        {/* <Video className="h-12 w-12 text-surface-400" /> */}
                        <video 
                        src={product?.demoVideo} 
                        controls 
                        className="w-full h-full rounded-lg"
                        >
                        Your browser does not support the video tag.
                      </video>
                      </div>
                      <p className="text-sm text-surface-500 mt-2">
                        Watch a quick demo of how this tool works and its main features.
                      </p>
                    </div>
                    )}
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-surface-900">Tags</h2>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-surface-100 text-surface-600 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {activeTab === 'howto' && (
                  <>
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4 text-surface-900">Prerequisites</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="h-5 w-5 text-secondary-500" />
                            <h3 className="font-medium text-surface-900">Required Tools</h3>
                          </div>
                          <ul className="space-y-2 text-sm text-surface-600">
                            <li>• Modern web browser</li>
                            <li>• Command line interface</li>
                            <li>• Node.js v14+</li>
                          </ul>
                        </div>
                        
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Database className="h-5 w-5 text-secondary-500" />
                            <h3 className="font-medium text-surface-900">Subscriptions</h3>
                          </div>
                          <ul className="space-y-2 text-sm text-surface-600">
                            <li>• OpenAI API key ($0.002 per 1K tokens)</li>
                            <li>• Optional: Cloud hosting provider</li>
                          </ul>
                        </div>
                        
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="h-5 w-5 text-secondary-500" />
                            <h3 className="font-medium text-surface-900">Skills Needed</h3>
                          </div>
                          <ul className="space-y-2 text-sm text-surface-600">
                            <li>• Basic understanding of JavaScript</li>
                            <li>• Familiarity with API concepts</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4 text-surface-900">Difficulty Level</h2>
                      <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-secondary-500 to-primary-500 w-1/2"></div>
                          </div>
                          <span className="font-medium text-secondary-700">Medium</span>
                        </div>
                        <p className="text-sm text-surface-600">
                          This tool requires some technical knowledge to set up and configure, but comes with comprehensive documentation to guide you through the process.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4 text-surface-900">Setup Process</h2>
                      <div className="space-y-4">
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <h3 className="font-medium mb-2 flex items-center gap-2 text-surface-900">
                            <div className="w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center text-sm text-white">1</div>
                            <span>Installation</span>
                          </h3>
                          <p className="text-sm text-surface-600 mb-2">
                            Install the package using npm or yarn:
                          </p>
                          <div className="bg-surface-100 p-2 rounded font-mono text-sm mb-2">
                            npm install ai-document-processor
                          </div>
                          <p className="text-sm text-surface-600">
                            This will install all required dependencies and set up the basic configuration.
                          </p>
                        </div>
                        
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <h3 className="font-medium mb-2 flex items-center gap-2 text-surface-900">
                            <div className="w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center text-sm text-white">2</div>
                            <span>Configuration</span>
                          </h3>
                          <p className="text-sm text-surface-600 mb-2">
                            Create a configuration file with your API keys and preferences:
                          </p>
                          <div className="bg-surface-100 p-2 rounded font-mono text-sm mb-2">
                            {`// config.js\nmodule.exports = {\n  apiKey: 'your-api-key',\n  modelName: 'gpt-4',\n  maxTokens: 2000\n};`}
                          </div>
                        </div>
                        
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <h3 className="font-medium mb-2 flex items-center gap-2 text-surface-900">
                            <div className="w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center text-sm text-white">3</div>
                            <span>Integration</span>
                          </h3>
                          <p className="text-sm text-surface-600">
                            Import the package into your application and start processing documents:
                          </p>
                          <div className="bg-surface-100 p-2 rounded font-mono text-sm mt-2">
                            {`const processor = require('ai-document-processor');\n\nprocessor.analyze('path/to/document.pdf')\n  .then(results => console.log(results))\n  .catch(err => console.error(err));`}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4 text-surface-900">Common Issues & Solutions</h2>
                      <div className="space-y-4">
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <h3 className="font-medium text-surface-900">API Rate Limiting</h3>
                          </div>
                          <p className="text-sm text-surface-600">
                            If you encounter rate limiting issues, implement a retry mechanism with exponential backoff or upgrade to a higher tier API plan.
                          </p>
                        </div>
                        
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <h3 className="font-medium text-surface-900">Memory Usage</h3>
                          </div>
                          <p className="text-sm text-surface-600">
                            For large documents, you may need to increase the available memory. Use the --max-old-space-size flag when running Node.js.
                          </p>
                        </div>
                        
                        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                          <div className="flex items-start gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <h3 className="font-medium text-surface-900">Performance Optimization</h3>
                          </div>
                          <p className="text-sm text-surface-600">
                            For better performance, process documents in batches and implement caching for frequently accessed results.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {activeTab === 'faq' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-surface-900">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                      {faqItems.map((faq, index) => (
                        <div key={index} className="border border-surface-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleFaq(index)}
                            className="w-full flex items-center justify-between p-4 text-left bg-surface-50 hover:bg-surface-100 transition-colors"
                          >
                            <span className="font-medium text-surface-900">{faq.question}</span>
                            {expandedFaq === index ? (
                              <ChevronUp className="h-5 w-5 text-surface-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-surface-400" />
                            )}
                          </button>
                          {expandedFaq === index && (
                            <div className="p-4 bg-white">
                              <p className="text-surface-600">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* Purchase Box */}
            <div className="bg-white rounded-xl border border-surface-200 p-6 mb-6 shadow-card">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-surface-900">${product.price}</h2>
                  <div className="flex items-center gap-1">
                    <Zap className="h-5 w-5 text-secondary-500" />
                    <span className="font-medium text-surface-900">{product.pulses} pulses</span>
                  </div>
                </div>
                <p className="text-surface-500 text-sm">One-time purchase, lifetime access</p>
              </div>
              
            <button
                onClick={handlePurchase}
                disabled={isLoading}
                className={`w-full bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg py-3 px-4 transition-colors flex items-center justify-center gap-2 mb-4 ${
                  isLoading ? 'opacity-70 cursor-wait' : ''
                }`}
                >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Purchase Now</span>
                  </>
                )}
             </button>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-100 rounded-full">
                    <Download className="h-5 w-5 text-surface-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Instant Download</p>
                    <p className="text-sm text-surface-500">Access blueprint immediately after purchase</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-100 rounded-full">
                    <Shield className="h-5 w-5 text-surface-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Secure Transaction</p>
                    <p className="text-sm text-surface-500">SSL encrypted payment</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Creator Box */}
            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-card">
              <h3 className="font-semibold mb-3 text-surface-900">About the Creator</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-secondary-500 rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {product.creator?.creator_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-surface-900">{product.creator?.creator_name}</p>
                  <p className="text-sm text-surface-500">{user?.title}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400' : 'text-surface-300'}`}
                      fill={star <= 4 ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-surface-500">4.0 (24 reviews)</span>
              </div>
              
              <p className="text-sm text-surface-600 mb-3">
                {user?.bio}
              </p>
              {user?.id !== product.creator?.creator_id && (
              <button 
                onClick={handleBookConsultation}
                className="w-full bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg py-3 px-4 transition-colors flex items-center justify-center gap-2 border border-surface-200 mb-4"
              >
                <MessageSquare className="h-4 w-4 text-secondary-500" />
                <span>Book Consultation</span>
              </button>
              )}
              <div className="space-y-2 text-sm text-surface-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary-500" />
                  <span>Expert help available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary-500" />
                  <span>Verified platform creator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-secondary-500" />
                  <span>Tailored to your needs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {relatedProducts.length > 0 && (
          <div className="mt-12 mb-24">
            <h2 className="text-2xl font-bold mb-6 text-surface-900">Other Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div 
                  key={relatedProduct.id}
                  className="bg-white rounded-xl overflow-hidden border border-surface-200 hover:border-secondary-500/50 transition-all duration-300 cursor-pointer shadow-card hover:shadow-card-hover"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 text-surface-900">{relatedProduct.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-surface-900">${relatedProduct.price}</span>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-secondary-500" />
                        <span className="text-sm text-surface-600">{relatedProduct.pulses} pulses</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => {setShowAuthModal(false)}}
            />
      )}

      {showChatModal && (
        <ChatModal 
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          product={product}
          user={user}
          consultationOptions={consultationOptions}
        />
      )}
    </div>
  );
}

function Tool(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function CreditCard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function Brain(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}