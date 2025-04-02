import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Plus, X, User, AlertCircle } from 'lucide-react';
import { QuantumBackground } from '../components/QuantumBackground';
import { AdminNav } from '../components/AdminNav';
import type { AuthState } from '../types';
import { useAuth } from "../context/AuthContext";


// Sample registered users for demonstration
const REGISTERED_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'user' }
];

interface Creator {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  isUnclaimed: boolean;
}

export function AdminAddProductPage() {
    const { user } = useAuth();
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatorSearch, setShowCreatorSearch] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [newCreator, setNewCreator] = useState<Creator>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    isUnclaimed: true
  });
  const [showNewCreatorForm, setShowNewCreatorForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'automation',
    tags: '',
    image: '',
    requirements: [] as string[],
    integrations: [] as string[],
    complexity: 'medium' as 'beginner' | 'medium' | 'advanced',
    faq: [] as { question: string; answer: string }[],
    consultationAvailable: false,
    consultationRate: '',
    thumbnail: null as File | null,
    mainImage: null as File | null,
    video: null as File | null,
    files: [] as File[]
  });

  // Add new state for FAQ
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Add new state for requirements and integrations
  const [newRequirement, setNewRequirement] = useState('');
  const [newIntegration, setNewIntegration] = useState('');

  // Add file input refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Add URL cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      if (formData.thumbnail) URL.revokeObjectURL(URL.createObjectURL(formData.thumbnail));
      if (formData.mainImage) URL.revokeObjectURL(URL.createObjectURL(formData.mainImage));
      if (formData.video) URL.revokeObjectURL(URL.createObjectURL(formData.video));
      formData.files.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
    };
  }, [formData]);

  // Add helper function for file preview URLs
  const getFilePreviewUrl = (file: File | null) => {
    if (!file) return '';
    return URL.createObjectURL(file);
  };

  // Handle file selection
  const handleFileSelect = (type: 'thumbnail' | 'mainImage' | 'video' | 'files', files: FileList | null) => {
    if (!files) return;

    switch (type) {
      case 'thumbnail':
      case 'mainImage':
      case 'video':
        setFormData(prev => ({ ...prev, [type]: files[0] }));
        break;
      case 'files':
        setFormData(prev => ({ ...prev, files: [...prev.files, ...Array.from(files)] }));
        break;
    }
  };

  // Handle file removal
  const handleFileRemove = (type: 'thumbnail' | 'mainImage' | 'video' | 'files', index?: number) => {
    if (type === 'files' && typeof index === 'number') {
      setFormData(prev => ({
        ...prev,
        files: prev.files.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({ ...prev, [type]: null }));
    }
  };

  // Handle adding FAQ
  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: newFaqQuestion, answer: newFaqAnswer }]
    }));
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  // Handle removing FAQ
  const handleRemoveFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  // Handle adding requirement
  const handleAddRequirement = () => {
    if (!newRequirement.trim()) return;
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, newRequirement]
    }));
    setNewRequirement('');
  };

  // Handle adding integration
  const handleAddIntegration = () => {
    if (!newIntegration.trim()) return;
    setFormData(prev => ({
      ...prev,
      integrations: [...prev.integrations, newIntegration]
    }));
    setNewIntegration('');
  };

  // Helper function to safely create object URLs
  const getObjectUrl = (file: File | null): string => {
    if (!file) return '';
    return URL.createObjectURL(file);
  };

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-card max-w-md text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-surface-900">Access Denied</h2>
          <p className="text-surface-600 mb-6">
            You don't have permission to access the admin panel.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg py-3 px-8 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', { 
      ...formData, 
      creator: selectedCreator || newCreator
    });
  };

  const filteredUsers = REGISTERED_USERS.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: typeof REGISTERED_USERS[0]) => {
    const [firstName, lastName] = user.name.split(' ');
    setSelectedCreator({
      id: user.id,
      firstName,
      lastName,
      username: user.email.split('@')[0],
      bio: '',
      isUnclaimed: false
    });
    setShowCreatorSearch(false);
  };

  const handleCreateNewCreator = () => {
    if (!newCreator.firstName.trim() || !newCreator.lastName.trim() || !newCreator.username.trim() || !newCreator.bio.trim()) return;
    
    // In a real app, this would:
    // 1. Create the unclaimed user account
    // 2. Mark the account as unclaimed in the database
    
    setSelectedCreator({
      ...newCreator,
      isUnclaimed: true
    });
    setShowNewCreatorForm(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <QuantumBackground intensity="low" className="absolute inset-0 pointer-events-none" overlay={true} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-surface-900">Add New Solution</h1>
              <p className="text-surface-600">Create a new AI solution in the marketplace</p>
            </div>
            <button 
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Admin Navigation */}
          <AdminNav />

          {/* Main Form */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Creator Selection */}
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h2 className="text-xl font-semibold mb-4">Creator Information</h2>
                
                {!selectedCreator && !showNewCreatorForm && !showCreatorSearch ? (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowCreatorSearch(true)}
                      className="w-full p-4 border-2 border-dashed border-surface-200 rounded-xl hover:border-secondary-500 hover:bg-surface-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Search className="h-5 w-5 text-surface-400" />
                      <span>Search Registered Users</span>
                    </button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-surface-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-surface-500">or</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNewCreatorForm(true)}
                      className="w-full p-4 border-2 border-dashed border-surface-200 rounded-xl hover:border-secondary-500 hover:bg-surface-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5 text-surface-400" />
                      <span>Create Unclaimed Creator</span>
                    </button>
                  </div>
                ) : showCreatorSearch ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto border border-surface-200 rounded-lg divide-y divide-surface-200">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="w-full p-3 text-left hover:bg-surface-50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-surface-100 rounded-full w-8 h-8 flex items-center justify-center">
                              <User className="h-4 w-4 text-surface-600" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-surface-500">@{user.email.split('@')[0]}</p>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-surface-400" />
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="p-4 text-center text-surface-500">
                          No users found
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCreatorSearch(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : selectedCreator ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-100 rounded-full w-10 h-10 flex items-center justify-center">
                          <User className="h-5 w-5 text-surface-600" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedCreator.firstName} {selectedCreator.lastName}</p>
                          <p className="text-sm text-surface-500">@{selectedCreator.username}</p>
                          {selectedCreator.isUnclaimed && (
                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>Unclaimed Account</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCreator(null);
                          setShowCreatorSearch(false);
                          setShowNewCreatorForm(false);
                        }}
                        className="text-surface-400 hover:text-surface-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <textarea
                      value={selectedCreator.bio}
                      onChange={(e) => setSelectedCreator({ ...selectedCreator, bio: e.target.value })}
                      placeholder="Enter creator bio..."
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 h-32"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          value={newCreator.firstName}
                          onChange={(e) => setNewCreator({ ...newCreator, firstName: e.target.value })}
                          placeholder="Enter first name"
                          className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          value={newCreator.lastName}
                          onChange={(e) => setNewCreator({ ...newCreator, lastName: e.target.value })}
                          placeholder="Enter last name"
                          className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-surface-400">@</span>
                        <input
                          type="text"
                          value={newCreator.username}
                          onChange={(e) => setNewCreator({ ...newCreator, username: e.target.value })}
                          placeholder="Enter username"
                          className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-8 focus:outline-none focus:border-secondary-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Creator Bio</label>
                      <textarea
                        value={newCreator.bio}
                        onChange={(e) => setNewCreator({ ...newCreator, bio: e.target.value })}
                        placeholder="Enter creator bio..."
                        className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 h-32"
                      />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">
                        This will create an unclaimed creator account. You can send them a password reset from the user management panel later.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNewCreatorForm(false)}
                        className="flex-1 px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateNewCreator}
                        disabled={!newCreator.firstName.trim() || !newCreator.lastName.trim() || !newCreator.username.trim() || !newCreator.bio.trim()}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Creator
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h2 className="text-xl font-semibold mb-4">Solution Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      placeholder="Enter solution title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 h-32"
                      placeholder="Enter solution description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                        placeholder="Enter price"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as typeof formData.category }))}
                        className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      >
                        <option value="automation">Automation</option>
                        <option value="integration">Integration</option>
                        <option value="workflow">Workflow</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a requirement..."
                      className="flex-1 bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 bg-surface-100 rounded-full flex items-center gap-2"
                        >
                          <span>{req}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              requirements: prev.requirements.filter((_, i) => i !== index)
                            }))}
                            className="text-surface-400 hover:text-surface-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Integrations Section */}
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h2 className="text-xl font-semibold mb-4">Integrations</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIntegration}
                      onChange={(e) => setNewIntegration(e.target.value)}
                      placeholder="Add an integration..."
                      className="flex-1 bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddIntegration}
                      className="px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.integrations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.integrations.map((integration, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 bg-surface-100 rounded-full flex items-center gap-2"
                        >
                          <span>{integration}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              integrations: prev.integrations.filter((_, i) => i !== index)
                            }))}
                            className="text-surface-400 hover:text-surface-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h2 className="text-xl font-semibold mb-4">FAQ</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      placeholder="Question"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                    />
                    <textarea
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      placeholder="Answer"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 h-24"
                    />
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="w-full px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                    >
                      Add FAQ
                    </button>
                  </div>
                  
                  {formData.faq.length > 0 && (
                    <div className="space-y-4 mt-6">
                      {formData.faq.map((faq, index) => (
                        <div key={index} className="bg-surface-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{faq.question}</h3>
                            <button
                              type="button"
                              onClick={() => handleRemoveFaq(index)}
                              className="text-surface-400 hover:text-surface-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-surface-600">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h2 className="text-xl font-semibold mb-4">Media & Files</h2>
                <div className="space-y-6">
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
                    <div className="flex items-center gap-4">
                      {formData.thumbnail ? (
                        <div className="relative w-24 h-24">
                          <img
                            src={getFilePreviewUrl(formData.thumbnail)}
                            alt="Thumbnail"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleFileRemove('thumbnail')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="w-24 h-24 bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors"
                        >
                          <Plus className="h-6 w-6 text-surface-400" />
                        </button>
                      )}
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect('thumbnail', e.target.files)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Main Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Main Image</label>
                    <div className="flex items-center gap-4">
                      {formData.mainImage ? (
                        <div className="relative w-full aspect-video">
                          <img
                            src={getFilePreviewUrl(formData.mainImage)}
                            alt="Main"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleFileRemove('mainImage')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => mainImageInputRef.current?.click()}
                          className="w-full aspect-video bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors"
                        >
                          <Plus className="h-6 w-6 text-surface-400" />
                        </button>
                      )}
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect('mainImage', e.target.files)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Video</label>
                    <div className="flex items-center gap-4">
                      {formData.video ? (
                        <div className="relative w-full aspect-video">
                          <video
                            src={getFilePreviewUrl(formData.video)}
                            controls
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleFileRemove('video')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full aspect-video bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors"
                        >
                          <Plus className="h-6 w-6 text-surface-400" />
                        </button>
                      )}
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileSelect('video', e.target.files)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Additional Files */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Files</label>
                    <button
                      type="button"
                      onClick={() => filesInputRef.current?.click()}
                      className="w-full p-4 bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors"
                    >
                      <Plus className="h-6 w-6 text-surface-400" />
                      <span className="ml-2">Add Files</span>
                    </button>
                    <input
                      ref={filesInputRef}
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect('files', e.target.files)}
                      className="hidden"
                    />
                    {formData.files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleFileRemove('files', index)}
                              className="text-surface-400 hover:text-surface-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pb-24">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}