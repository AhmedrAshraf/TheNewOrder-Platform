import React, { useState, useRef, useEffect } from 'react';
import { Grid3X3, ListFilter, TrendingUp, Zap, Search, ChevronDown, X, Check, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { supabase } from '../lib/supabase';

function MultiSelectDropdown({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder,
  label,
  color = 'purple'
}: { 
  options: string[], 
  selectedValues: string[], 
  onChange: (values: string[]) => void, 
  placeholder: string,
  label: string,
  color?: 'purple' | 'blue' | 'green'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllOptions, setShowAllOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const getBadgeColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-primary-600/20 text-primary-400';
      case 'green': return 'bg-secondary-600/20 text-secondary-400';
      default: return 'bg-primary-600/20 text-primary-400';
    }
  };

  const displayedOptions = searchTerm 
    ? filteredOptions 
    : showAllOptions 
      ? options 
      : options.slice(0, 7);

  const hasMoreOptions = !searchTerm && !showAllOptions && options.length > 7;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="mb-1 text-sm text-surface-600">{label}</div>
      
      <div className="relative mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-3 pl-9 focus:outline-none focus:border-secondary-500 text-sm"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-surface-400 hover:text-surface-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="bg-surface-50 border border-surface-200 rounded-lg max-h-60 overflow-y-auto">
        {displayedOptions.length === 0 ? (
          <div className="p-3 text-center text-surface-600 text-sm">No results found</div>
        ) : (
          <>
            {displayedOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-2 hover:bg-surface-100 flex items-center justify-between"
              >
                <span>{option === 'all' ? 'All' : option?.charAt(0).toUpperCase() + option.slice(1)}</span>
                {selectedValues.includes(option) ? (
                  <Check className={`h-4 w-4 ${color === 'blue' ? 'text-primary-400' : color === 'green' ? 'text-secondary-400' : 'text-primary-400'}`} />
                ) : null}
              </button>
            ))}
            
            {hasMoreOptions && (
              <button
                onClick={() => setShowAllOptions(true)}
                className="w-full text-left px-4 py-2 text-sm text-surface-600 hover:text-surface-900 hover:bg-surface-100 flex items-center justify-between"
              >
                <span>Show all options</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
      
      {selectedValues.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {selectedValues.map(value => (
              <div 
                key={value}
                className={`${getBadgeColorClasses()} px-2 py-1 rounded-full text-xs flex items-center`}
              >
                <span>{value}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(selectedValues.filter(v => v !== value));
                  }}
                  className="ml-1 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onChange([])}
            className="text-xs text-surface-600 hover:text-surface-900 mt-2 underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export function MarketplacePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'price' | 'pulses'>('popular');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [solutions, setSolutions] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{
    const fetchSolutions = async () => {
      console.log("fetching solutions");
      
      const { data, error } = await supabase
      .from('solutions')
      .select()
      // .eq('status', 'approved')

      if(error){
        console.error("error while fetching solutions", error);
        return
      }
      setSolutions(data);      
      console.log("solutions" ,data);
      
    }
    fetchSolutions()
  }, [])
  
  const categories = [
    'productivity',
    'marketing',
    'sales',
    'customer support',
    'content creation',
    'data analysis',
    'human resources',
    'finance',
    'engineering',
    'devops',
    'secops',
    'other'
  ];

  const channels = [
    'facebook',
    'instagram',
    'linkedin',
    'pinterest',
    'twitter',
    'tiktok',
    'youtube',
    'snapchat',
    'whatsapp',
    'telegram',
    'discord',
    'slack',
    'reddit',
    'medium'
  ];

  const platforms = [
    'make',
    'zapier',
    'n8n',
    'bubble',
    'airtable',
    'notion',
    'webflow',
    'retool',
    'appsmith'
  ];

  const getCategoryForProduct = (product: Product): string => {
    const tags = product.tags.map(tag => tag.toLowerCase());
    
    if (tags.includes('email') || tags.includes('marketing')) return 'marketing';
    if (tags.includes('support') || tags.includes('customer-service')) return 'customer support';
    if (tags.includes('content') || tags.includes('video')) return 'content creation';
    if (tags.includes('document') || tags.includes('processing')) return 'productivity';
    if (tags.includes('seo') || tags.includes('social-media')) return 'marketing';
    
    return 'other';
  };

  const getChannelForProduct = (product: Product): string => {
    const tags = product.tags.map(tag => tag.toLowerCase());
    const title = product.title.toLowerCase();
    
    if (tags.includes('pinterest') || title.includes('pinterest')) return 'pinterest';
    if (tags.includes('linkedin') || title.includes('linkedin')) return 'linkedin';
    if (tags.includes('social-media') && title.includes('content')) return 'instagram';
    if (tags.includes('email')) return 'gmail';
    if (tags.includes('support') || tags.includes('chatbot')) return 'whatsapp';
    
    return 'other';
  };

  const getPlatformForProduct = (product: Product): string => {
    const description = product.description.toLowerCase();
    
    if (description.includes('automation')) return 'zapier';
    if (description.includes('workflow')) return 'make';
    if (description.includes('integration')) return 'n8n';
    
    return 'other';
  };

  const filteredProducts = solutions?.filter(product => {
    const matchesSearch = searchQuery ? 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) :
      true;
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(getCategoryForProduct(product));
    
    const matchesChannel = selectedChannels.length === 0 || 
      selectedChannels.includes(getChannelForProduct(product));
    
    const matchesPlatform = selectedPlatforms.length === 0 || 
      selectedPlatforms.includes(getPlatformForProduct(product));
    
    return matchesSearch && matchesCategory && matchesChannel && matchesPlatform;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.pulses - a.pulses;
      case 'recent':
        return b.id.localeCompare(a.id);
      case 'price':
        return a.price - b.price;
      case 'pulses':
        return b.pulses - a.pulses;
      default:
        return 0;
    }
  });

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedChannels([]);
    setSelectedPlatforms([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2 text-surface-900">AI Workflow Marketplace</h1>
              <p className="text-surface-600">Discover and integrate powerful AI solutions</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg ${
                    view === 'grid' 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                      : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg ${
                    view === 'list' 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                      : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  <ListFilter className="h-5 w-5" />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-surface-100 border border-surface-200 rounded-lg px-4 py-2"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Added</option>
                <option value="price">Price: Low to High</option>
                <option value="pulses">Most Pulses</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="I want to..."
                className="w-full bg-surface-50 border border-surface-200 rounded-xl py-4 px-6 pl-12 text-lg focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 shadow-sm"
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

          <div className="flex flex-col lg:flex-row gap-8 pb-24">
            <div className="w-full lg:w-64 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4 font-poppins text-surface-900">Categories</h3>
                <MultiSelectDropdown 
                  options={categories}
                  selectedValues={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Select Categories"
                  label="Filter by category"
                  color="purple"
                />
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4 font-poppins text-surface-900">Popular Channels</h3>
                <MultiSelectDropdown 
                  options={channels}
                  selectedValues={selectedChannels}
                  onChange={setSelectedChannels}
                  placeholder="Select Channels"
                  label="Filter by channel"
                  color="blue"
                />
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4 font-poppins text-surface-900">Building Platforms</h3>
                <MultiSelectDropdown 
                  options={platforms}
                  selectedValues={selectedPlatforms}
                  onChange={setSelectedPlatforms}
                  placeholder="Select Platforms"
                  label="Filter by platform"
                  color="green"
                />
              </div>
              
              {(selectedCategories.length > 0 || selectedChannels.length > 0 || selectedPlatforms.length > 0 || searchQuery) && (
                <button 
                  onClick={clearAllFilters}
                  className="w-full py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors text-surface-900"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="mb-4 text-surface-600">
                Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'result' : 'results'}
              </div>
              
              <div className={`grid gap-6 ${
                view === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedProducts.map((product) => (
                  console.log("product", product.id),
                  
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl overflow-hidden border border-surface-200 hover:border-secondary-500/50 transition-all duration-300 group cursor-pointer shadow-card hover:shadow-card-hover ${
                      view === 'list' ? 'flex' : 'flex flex-col'
                    }`}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className={`relative ${view === 'list' ? 'w-48' : 'w-full'} h-48`}>
                      <img
                        src={product.image}
                        alt={product.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-primary-500/20 text-primary-600 text-xs rounded-full">
                            {getCategoryForProduct(product)}
                          </span>
                          
                          {getChannelForProduct(product) !== 'other' && (
                            <span className="px-2 py-1 bg-primary-500/20 text-primary-600 text-xs rounded-full">
                              {getChannelForProduct(product)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-secondary-500" />
                            <span className="text-sm text-surface-600">{product.pulses}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-surface-900 mb-1 font-poppins line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-surface-600 mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-surface-900">${product.price}</span>
                          {product.creator?.creator_name && (
                          <p className="text-sm text-surface-600">by {product.creator?.creator_name}</p>
                        )}
                        </div>
                        <button 
                          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-colors shadow-button hover:shadow-button-hover whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {sortedProducts.length === 0 && (
                <div className="bg-white p-8 rounded-xl text-center border border-surface-200 shadow-card">
                  <p className="text-surface-600 mb-4">No products found with the current filters.</p>
                  <button 
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-colors shadow-button hover:shadow-button-hover"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}