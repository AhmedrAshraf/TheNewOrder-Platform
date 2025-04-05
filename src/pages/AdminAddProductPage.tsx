import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Plus, X, User, AlertCircle, LogOut, UserPlus } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';
import type { AuthState } from '../types';
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';

// Sample registered users for demonstration

interface Creator {
  id?: string;
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
  const [registeredUser, setRegisteredUser] = useState<any[]>([])
  const [files, setFiles] = useState({})
  
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
    files: [] as File[],
    status: 'approved',
  });

  useEffect(()=>{
    const fetchUser = async () => {
      const { data, error } = await supabase
      .from('users')
      .select()

      if(error){
        console.log("Error", error);
        return []
      }
      setRegisteredUser(data)      
    }
    fetchUser()
  }, [])

  // Add new state for FAQ
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Add new state for requirements and integrations
  const [newRequirement, setNewRequirement] = useState('');
  const [newIntegration, setNewIntegration] = useState('');
  


  // Handle file selection
  const handleFileSelect = async (type: 'thumbnail' | 'mainImage' | 'video' | 'files', files: FileList | null) => {
    if (!files) return;
    console.log("type", type, "files", files );
    
    switch (type) {
      case 'thumbnail':{
        const dotIndex = files[0].name.lastIndexOf('.');
        const fileName = `thumbnails/${user?.id}/${files[0].name.substring(0, dotIndex)}${new Date().getMilliseconds()}${files[0].name.substring(dotIndex)}`;
        console.log("fileName", fileName);
        
        const { data, error } = await supabase
        .storage
        .from('solutions-images')
        .upload(fileName, files[0], {
          cacheControl: '3600',
          upsert: false
        })
        if(error){
          console.error("error while uploading image", error);
          return
        }
        const { data:urlData } = supabase
        .storage
        .from('solutions-images')
        .getPublicUrl(fileName)

        setFormData(prev => ({ ...prev, thumbnail: urlData.publicUrl }));
        break;
      }
      case 'mainImage':{
        const dotIndex = files[0].name.lastIndexOf('.');
        const fileName = `mainImage/${user?.id}/${files[0].name.substring(0, dotIndex)}${new Date().getMilliseconds()}${files[0].name.substring(dotIndex)}`;

        const { data, error } = await supabase
        .storage
        .from('solutions-images')
        .upload(fileName, files[0], {
          cacheControl: '3600',
          upsert: false
        })
        if(error){
          console.error("error while uploading image", error);
          return
        }
        const { data:urlData } = supabase
        .storage
        .from('solutions-images')
        .getPublicUrl(fileName)

        setFormData(prev => ({ ...prev, mainImage: urlData.publicUrl }));
        break;
      }
      case 'video':{
        const dotIndex = files[0].name.lastIndexOf('.');
        const fileName = `solution-videos/${user?.id}/${files[0].name.substring(0, dotIndex)}${new Date().getMilliseconds()}${files[0].name.substring(dotIndex)}`;

        const { data, error } = await supabase
        .storage
        .from('solutions-images')
        .upload(fileName, files[0], {
          cacheControl: '3600',
          upsert: false
        })
        if(error){
          console.error("error while uploading image", error);
          return
        }
        const { data:urlData } = supabase
        .storage
        .from('solutions-images')
        .getPublicUrl(fileName)

        setFormData(prev => ({ ...prev, video: urlData.publicUrl }));
        break;
      }
      case 'files': {
        const originalName = files[0].name;
        const dotIndex = originalName.lastIndexOf('.');
        const baseName = originalName.substring(0, dotIndex).replace(/\s+/g, '_');
        const extension = originalName.substring(dotIndex);
        const fileKey = `files/${user?.id}/${baseName}${new Date().getMilliseconds()}${extension}`;
        
        console.log("fileKey", fileKey);
        
        const { data, error } = await supabase
          .storage
          .from('solutions-images')
          .upload(fileKey, files[0], {
            cacheControl: '3600',
            upsert: false
          });
        if (error) {
          console.error("Error while uploading file", error);
          return;
        }
        
        const { data: urlData } = supabase
          .storage
          .from('solutions-images')
          .getPublicUrl(fileKey);
        
        // Store both the key and the URL
        setFormData(prev => ({
          ...prev,
          files: [...prev.files, { key: fileKey, url: urlData.publicUrl }]
        }));
        break;
      }}      
  };
  
  const handleFileRemove = async (fileKey: string, index?: number) => {

    const { data, error } = await supabase
      .storage
      .from('solutions-images')
      .remove([fileKey]);
    if (error) {
      console.error("Error deleting file", error);
      return false;
    }
    console.log("File deleted", data);
    return true;
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
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', { ...formData, creator: selectedCreator || newCreator });
    const priceValue = formData.price.trim() !== '' ? parseFloat(formData.price) : null;
    const consultationRateValue = formData.consultationRate.trim() !== '' ? parseFloat(formData.consultationRate) : null;

    const { error } = await supabase
      .from('solutions')
      .insert([
        { 
          title: formData.title,
          description: formData.description,
          price: priceValue,
          category: formData.category,
          image: formData.image,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          complexity: formData.complexity,
          integrations: formData.integrations,
          faq: formData.faq,
          consultationAvailable: formData.consultationAvailable,
          consultationRate: consultationRateValue,
          status: formData.status,
          // creator: {creator_name: selectedCreator?.username, creator_id: selectedCreator.id, creatorBio: selectedCreator?.bio},
          creator: selectedCreator ? { creator_name: selectedCreator.username, creator_id: selectedCreator.id, creatorBio: selectedCreator.bio}: null,
          thumbnail: formData.thumbnail,
          video: formData.video,
          files: formData.files,
        }
      ])
  
      if(error){
        console.error('error', error);
      }else{
      console.log("✅ solutions added");``
      }
      // navigate('/marketplace');
  };

  const filteredUsers = registeredUser.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: typeof REGISTERED_USERS[0]) => {
  console.log("user name handleSelectUser", user);
  
    setSelectedCreator({
      id: user.id,
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
                        onClick={() => { setSelectedCreator(null); setShowCreatorSearch(false); setShowNewCreatorForm(false);}}
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
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      placeholder="Enter solution title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                    required
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
                      required
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
                      required
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
                    required
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
                        console.log("formData.thumbnail", formData.thumbnail),
                        
                        <div className="relative w-24 h-24">
                          <img src={formData?.thumbnail} lt="Thumbnail" className="w-full h-full object-cover rounded-lg"/>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(formData.thumbnail)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                         htmlFor="thumbnailInput"
                         className="w-24 h-24 bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors cursor-pointer"
                        >
                          <Plus className="h-6 w-6 text-surface-400" />
                        </label>
                      )}
                      <input
                        id="thumbnailInput"
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
                        <div className="relative w-full max-h-56 overflow-y-scroll">
                          <img
                            src={formData?.mainImage}
                            alt="Main"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleFileRemove(formData.mainImage)}
                            className="absolute -top-2 -right-2 p-1 text-white rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor='mainImageInput'
                          className="w-full p-3 bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors cursor-pointer"
                        >
                          <Plus className="h-6 w-6 text-surface-400" />
                        </label>
                      )}
                      <input
                       id='mainImageInput'
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
                        <div className="relative w-full">
                          <video
                            src={formData.video}
                            controls
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {handleFileRemove(formData.video);  setFormData(prev => ({ ...prev, thumbnail: null}));}}
                            className="absolute p-3 -top-2 -right-2 text-white rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor='videoInput' 
                          className="w-full p-3 bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors cursor-pointer"
                        >
                          <Plus className="h-6 w-6 text-surface-400" />
                        </label>
                      )}
                      <input
                        type="file"
                        id='videoInput'
                        accept="video/*"
                        onChange={(e) => handleFileSelect('video', e.target.files)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Additional Files */}
                  <div>
                    <label>Additional Files</label>
                    <label htmlFor='filesInput' className="w-full p-3 bg-surface-50 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center hover:border-secondary-500 hover:bg-surface-100 transition-colors cursor-pointer">
                      <Plus className="h-6 w-6 text-surface-400" />
                      <span className="ml-2">Add Files</span>
                    </label>
                    <input
                      id='filesInput'
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect('files', e.target.files)}
                      className="hidden"
                    />
                    {formData.files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.files.map((fileObj, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                            <img src={fileObj.url} alt={`image ${index + 1}`} className="w-20 h-20 object-cover" />
                            <button
                              type="button"
                              onClick={async () => {
                                const deleted = await handleFileRemove(fileObj.key, index);
                                if (deleted) {
                                  setFormData(prev => ({
                                    ...prev,
                                    files: prev.files.filter((_, i) => i !== index)
                                  }));
                                }
                              }}
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