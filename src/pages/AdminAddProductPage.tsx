import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Shield, Search, Plus, X, User, AlertCircle, LogOut, UserPlus, ArrowRight, Upload, FolderOpen,  } from 'lucide-react';
import {Loader2, Upload, X, ArrowRight, CheckCircle, Clock, AlertCircle, Video, FolderOpen, Shield,  Code, Download, Database, Globe, Server, Search, Plus, User,  } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';
import type { AuthState } from '../types';
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Sample registered users for demonstration

interface Creator {
  id?: string;
  email: string;
  bio: string;
  isUnclaimed: boolean;
}

export function AdminAddProductPage() {
  // const { user } = useAuth();
  // const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatorSearch, setShowCreatorSearch] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [registeredUser, setRegisteredUser] = useState<any[]>([])
  
  const [newCreator, setNewCreator] = useState<Creator>({
    name: '',
    last_name: '',
    email: '',
    bio: '',
    isUnclaimed: true
  });

  const [showNewCreatorForm, setShowNewCreatorForm] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [newRequirement, setNewRequirement] = useState('');
    const [newIntegration, setNewIntegration] = useState('');
    const [showRequirementInput, setShowRequirementInput] = useState(false);
    const [showIntegrationInput, setShowIntegrationInput] = useState(false);
    const [bluePrint, setBluePrint] = useState(false)
    const requirementInputRef = useRef<HTMLInputElement>(null);
    const integrationInputRef = useRef<HTMLInputElement>(null);
    const {user} = useAuth() 
    const [image , setImage] = useState(null)
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null); 
    const [zipUrl, setZipUrl] = useState<string | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [videoLoading, setVideoLoading] = useState(false)
    const [demoVideo, setDemoVideo] = useState(false)
    const [newFeature, setNewFeature] = useState('');

  // Add new state variables for How to Make It Work section
  const [newTool, setNewTool] = useState('');
  const [newSubscription, setNewSubscription] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newSetupStep, setNewSetupStep] = useState({ title: '', description: '' });
  const [newCommonIssue, setNewCommonIssue] = useState({ title: '', description: '' });
  const [showToolInput, setShowToolInput] = useState(false);
  const [showSubscriptionInput, setShowSubscriptionInput] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showSetupStepInput, setShowSetupStepInput] = useState(false);
  const [showCommonIssueInput, setShowCommonIssueInput] = useState(false);
  const toolInputRef = useRef<HTMLInputElement>(null);
  const subscriptionInputRef = useRef<HTMLInputElement>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState(null)
    const [showFeatureInput, setShowFeatureInput] = useState(false);
    const featureInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      price: '',
      category: 'automation' as Product['category'],
      tags: '',
      image: '',
      bluePrint: '',
      complexity: 'medium' as 'beginner' | 'medium' | 'advanced',
      integrations: [] as string[],
      requirements: [] as string[],
      key_features: [] as string[],
      faq: [] as { question: string; answer: string }[],
      creatorBio: '',
      consultationAvailable: false,
      consultationRate: '',
      status: 'approved',
      demoVideo: '',
      how_to_make_it_work: {
      prerequisites: {
        tools: [] as string[],
        subscriptions: [] as string[],
        skills: [] as string[]
      },
      difficulty_level: {
        level: 'medium' as 'beginner' | 'medium' | 'advanced',
        setupTime: '',
        learningCurve: '',
        technicalRequirements: '',
        supportAvailability: ''
      },
      setup_process: [] as { title: string, description: string }[],
      common_issues: [] as { title: string, description: string }[]
    }
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

  const filteredUsers = registeredUser.filter(user =>
  user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user) => {
    setSelectedCreator({
      id: user.id,
      email: user.email,
      isUnclaimed: false
    });
    setShowCreatorSearch(false);
  };

  const handleCreateNewCreator = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newCreator.email,
        password: Math.random().toString(36).slice(-8),
        options: {
          data: {
            first_name: newCreator.name,
            last_name: newCreator.last_name,
            bio: newCreator.bio,
            role: 'creator'
          }
        }
      });

      if (authError) throw authError;

      const { data: creatorData, error: creatorError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            name: newCreator.name,
            last_name: newCreator.last_name,
            email: newCreator.email,
            bio: newCreator.bio,
          }
        ])
        .select()
        .single();

      if (creatorError) throw creatorError;

      setRegisteredUser(prevUsers => [...prevUsers, creatorData]);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        newCreator.email,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (resetError) throw resetError;

      toast.success('Creator account created successfully! Verification email sent.');
      setShowNewCreatorForm(false);
      setNewCreator({
        name: '',
        last_name: '',
        email: '',
        bio: ''
      });
    } catch (error) {
      console.error('Error creating creator:', error);
      toast.error('Failed to create creator account. Please try again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(async (file) => {
      const uploadImages = await uploadImage(file);
      if (uploadImages) {
        setFormData(prev => ({...prev,image: uploadImages}));
      }
    });
  };

  const handleAddSetupStep = () => {
    if (newSetupStep.title.trim() && newSetupStep.description.trim()) {
      setFormData(prev => ({
        ...prev,
        how_to_make_it_work: {
          ...prev.how_to_make_it_work,
          setup_process: [...prev.how_to_make_it_work.setup_process, { 
            title: newSetupStep.title.trim(), 
            description: newSetupStep.description.trim() 
          }]
        }
      }));
      setNewSetupStep({ title: '', description: '' });
      setShowSetupStepInput(false);
    }
  };

  const handleAddCommonIssue = () => {
    if (newCommonIssue.title.trim() && newCommonIssue.description.trim()) {
      setFormData(prev => ({
        ...prev,
        how_to_make_it_work: {
          ...prev.how_to_make_it_work,
          common_issues: [...prev.how_to_make_it_work.common_issues, { 
            title: newCommonIssue.title.trim(), 
            description: newCommonIssue.description.trim() 
          }]
        }
      }));
      setNewCommonIssue({ title: '', description: '' });
      setShowCommonIssueInput(false);
    }
  };

  const handleRemoveTool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      how_to_make_it_work: {
        ...prev.how_to_make_it_work,
        prerequisites: {
          ...prev.how_to_make_it_work.prerequisites,
          tools: prev.how_to_make_it_work.prerequisites.tools.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleRemoveSubscription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      how_to_make_it_work: {
        ...prev.how_to_make_it_work,
        prerequisites: {
          ...prev.how_to_make_it_work.prerequisites,
          subscriptions: prev.how_to_make_it_work.prerequisites.subscriptions.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      how_to_make_it_work: {
        ...prev.how_to_make_it_work,
        prerequisites: {
          ...prev.how_to_make_it_work.prerequisites,
          skills: prev.how_to_make_it_work.prerequisites.skills.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleRemoveSetupStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      how_to_make_it_work: {
        ...prev.how_to_make_it_work,
        setup_process: prev.how_to_make_it_work.setup_process.filter((_, i) => i !== index)
      }
    }));
  };

  const handleRemoveCommonIssue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      how_to_make_it_work: {
        ...prev.how_to_make_it_work,
        common_issues: prev.how_to_make_it_work.common_issues.filter((_, i) => i !== index)
      }
    }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const dotIndex = file.name.lastIndexOf('.');
    const fileName = `thumbnail/${user?.id}/${file.name.substring(0, dotIndex)}${Date.now()}${file.name.substring(dotIndex)}`;
    console.log("fileName", fileName);
  
    const { error } = await supabase.storage
      .from('solutions-images')
      .upload(fileName, file);
  
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  
    const { data: publicURL, error: urlError } = await supabase.storage
      .from('solutions-images')
      .getPublicUrl(fileName);
      
      if (urlError) {
        console.error('Error getting public URL:', urlError);
        return null;
      }
      
    setImage(publicURL.publicUrl)
    return publicURL.publicUrl;
  };
  const sanitizeFileName = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9.\-_]/g, '_');
  };

  const uploadBluePrint = async (file: File) =>{
    const dotIndex = file.name.lastIndexOf('.');
    const rawName = file.name.substring(0, dotIndex);
    const extension = file.name.substring(dotIndex);
    console.log("🚀~ extension:", extension)
    
    const safeName = sanitizeFileName(rawName);
    const fileName = `bluePrint/${user?.id}/${safeName}_${Date.now()}${extension}`;
    try{
      setLoading(true)
      const { error } = await supabase.storage
      .from('solutions-images')
      .upload(fileName, file);
  
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  
    const { data: publicURL, error: urlError } = await supabase.storage
      .from('solutions-images')
      .getPublicUrl(fileName);
      
      if (urlError) {
        console.error('Error getting public URL:', urlError);
        return null;
      }
      
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
        setThumbnail(publicURL.publicUrl);
        console.log("thumbnail");
      } else if (['.mp4', '.mov', '.webm'].includes(extension)) {
        setVideoUrl(publicURL.publicUrl);
        console.log("mov");
      } else if (extension === '.zip') {
        setZipUrl(publicURL.publicUrl);
        console.log("zip");
      } else {
        console.warn("Unsupported file type");
      }
    return publicURL.publicUrl;
    }catch(error){
      console.log("Error", error);
    }finally{
      setLoading(false)
    }
  }

  const uploadDemoVideo = async (file: file) =>{
        const dotIndex = file.name.lastIndexOf('.');
        const rawName = file.name.substring(0, dotIndex);
        const extension = file.name.substring(dotIndex);
        
        const safeName = sanitizeFileName(rawName);
        const fileName = `demoVideo/${user?.id}/${safeName}_${Date.now()}${extension}`;
        try{
          setVideoLoading(true)
          const { error } = await supabase.storage
          .from('solutions-images')
          .upload(fileName, file);
      
        if (error) {
          console.error('Error uploading image:', error);
          return null;
        }
      
        const { data: publicURL, error: urlError } = await supabase.storage
          .from('solutions-images')
          .getPublicUrl(fileName);
          
          if (urlError) {
            console.error('Error getting public URL:', urlError);
            return null;
          }
          setDemoVideo(file.name)
          return publicURL.publicUrl;
        }
        catch(error){
          console.log("Error", error);
        }
        finally{
          setVideoLoading(false)
        }
    }
  

const handleFileInput = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("type", type);
    
    if (e.target.files) {
      if(type === 'thumbnail'){
        const uploadImages = await uploadImage(e.target.files[0]);
        if (uploadImages) {
          setFormData(prev => ({...prev,image: uploadImages}));
        }
      }else if(type === 'bluePrint'){
        const uploadBluePrintImage = await uploadBluePrint(e.target.files[0]);
        if (uploadBluePrintImage) {
          setBluePrint(true); 
          setFormData(prev => ({ ...prev, bluePrint: uploadBluePrintImage }));
        }
      }
      else if(type === 'demoVideo'){
        const uploadVideo = await uploadDemoVideo(e.target.files[0]);
        if (uploadVideo) {
          setFormData(prev => ({ ...prev, demoVideo: uploadVideo }));
        }
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handle Submit function called", formData);
    const priceValue = formData.price.trim() === "" ? null : Number(formData.price);
    const consultationRateValue = formData.consultationRate.trim() === "" ? null : Number(formData.consultationRate);
    e.preventDefault();

    const { error } = await supabase
    .from('solutions')
    .insert([
      { 
        title: formData.title,
        description: formData.description,
        price: priceValue,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        complexity: formData.complexity,
        integrations: formData.integrations,
        key_features: formData.key_features,
        faq: formData.faq,
        consultationAvailable: formData.consultationAvailable,
        consultationRate: consultationRateValue,
        status: formData.status,
        creator: {creator_name: user?.name, creator_id: user.id, creator_title: user?.title, creator_bio: user?.bio},
        image: formData.image,
        bluePrint: formData.bluePrint ,
        demoVideo: formData.demoVideo,
        how_to_make_it_work: formData.how_to_make_it_work
      }
    ])

    if(error){
      console.error('error', error);
    }
    console.log("✅ solutions added");
    navigate('/marketplace');
  };

  const addFaqItem = () => {
    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeFaqItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  const toggleIntegration = (integration: string) => {
    if (integration === 'Other') {
      setShowIntegrationInput(true);
      setTimeout(() => integrationInputRef.current?.focus(), 0);
      return;
    }

    setFormData(prev => {
      if (prev.integrations.includes(integration)) {
        return {
          ...prev,
          integrations: prev.integrations.filter(i => i !== integration)
        };
      } else {
        return {
          ...prev,
          integrations: [...prev.integrations, integration]
        };
      }
    });
  };

  const toggleRequirement = (req: string) => {
    if (req === 'Other') {
      setShowRequirementInput(true);
      setTimeout(() => requirementInputRef.current?.focus(), 0);
      return;
    }

    setFormData(prev => {
      if (prev.requirements.includes(req)) {
        return {
          ...prev,
          requirements: prev.requirements.filter(r => r !== req)
        };
      } else {
        return {
          ...prev,
          requirements: [...prev.requirements, req]
        };
      }
    });
  };

  const handleNewRequirementKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
      setShowRequirementInput(false);
    }
  };

  const handleNewIntegrationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newIntegration.trim()) {
      setFormData(prev => ({
        ...prev,
        integrations: [...prev.integrations, newIntegration.trim()]
      }));
      setNewIntegration('');
      setShowIntegrationInput(false);
    }
  };

  const availableIntegrations = [
    "ChatGPT",
    "Claude",
    "DALL-E",
    "Google Drive",
    "Google Sheets",
    "WhatsApp",
    "Telegram",
    "Airtable",
    "Other"
  ];

  const availableRequirements = [
    "N8N",
    "Make",
    "Relevance AI",
    "Botpress",
    "Automate.io",
    "Other"
  ];

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        key_features: [...prev.key_features, newFeature.trim()]
      }));
      setNewFeature('');
      setShowFeatureInput(false);
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      key_features: prev.key_features.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4 m">Submit Your AI Workflow</h1>
          <p className="text-lg text-surface-600">Share your innovation with the world</p>
        </div>
        <form onSubmit={(e) => { handleSubmit(e) }} className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
            <h2 className="text-xl font-semibold mb-4">Creator Information</h2>                

            <div>
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
                          <p className="font-medium">{selectedCreator.name} {selectedCreator.last_name}</p>
                          <p className="text-sm text-surface-500">@{selectedCreator.email}</p>
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          value={newCreator.name}
                          onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                          placeholder="Enter first name"
                          className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          value={newCreator.last_name}
                          onChange={(e) => setNewCreator({ ...newCreator, last_name: e.target.value })}
                          placeholder="Enter last name"
                          className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={newCreator.email}
                        onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
                        placeholder="Enter email address"
                        className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                      />
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
                        disabled={!newCreator.name.trim() || !newCreator.last_name.trim() || !newCreator.email.trim() || !newCreator.bio.trim()}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Creator
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  placeholder="Enter your automation title"
                  required
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Description <span className="text-red-500">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 h-32"
                  placeholder="Describe your automation..."
                  required
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Price ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  min="0"
                  step="0.01"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  placeholder="Set your price"
                  required
                />
                  <p className="text-xs text-surface-500 mt-1">Note: 5% of the order amount will be deducted as a platform fee.</p>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Product['category'] }))}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  required
                >
                  <option value="automation">Automation</option>
                  <option value="integration">Integration</option>
                  <option value="workflow">Workflow</option>
                </select>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Tags <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  placeholder="Enter tags separated by commas"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter tags separated by commas</p>
              </div>
             </div>
            
            <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Requirements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableRequirements.map((req) => (
                  <label key={req} className="flex items-center gap-2 p-2 bg-surface-50 rounded-lg cursor-pointer hover:bg-surface-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.requirements.includes(req)}
                      onChange={() => toggleRequirement(req)}
                      className="h-4 w-4 text-secondary-500 focus:ring-secondary-500 border-surface-300 rounded"
                    />
                    <span className="text-sm">{req}</span>
                  </label>
                ))}
              </div>
              {showRequirementInput && (
                <div className="mt-2">
                  <input
                    ref={requirementInputRef}
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={handleNewRequirementKeyDown}
                    placeholder="Type and press Enter"
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  />
                </div>
              )}
              {formData.requirements.filter(r => !availableRequirements.includes(r)).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.requirements
                    .filter(r => !availableRequirements.includes(r))
                    .map((r, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-surface-100 text-surface-700 rounded-full text-sm"
                      >
                        {r}
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            requirements: prev.requirements.filter(req => req !== r)
                          }))}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Integrations</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableIntegrations.map((integration) => (
                  <label key={integration} className="flex items-center gap-2 p-2 bg-surface-50 rounded-lg cursor-pointer hover:bg-surface-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.integrations.includes(integration)}
                      onChange={() => toggleIntegration(integration)}
                      className="h-4 w-4 text-secondary-500 focus:ring-secondary-500 border-surface-300 rounded"
                    />
                    <span className="text-sm">{integration}</span>
                  </label>
                ))}
              </div>
              {showIntegrationInput && (
                <div className="mt-2">
                  <input
                    ref={integrationInputRef}
                    type="text"
                    value={newIntegration}
                    onChange={(e) => setNewIntegration(e.target.value)}
                    onKeyDown={handleNewIntegrationKeyDown}
                    placeholder="Type and press Enter"
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  />
                </div>
              )}
              {formData.integrations.filter(i => !availableIntegrations.includes(i)).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.integrations
                    .filter(i => !availableIntegrations.includes(i))
                    .map((i, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-surface-100 text-surface-700 rounded-full text-sm"
                      >
                        {i}
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            integrations: prev.integrations.filter(int => int !== i)
                          }))}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">FAQ Items</h3>
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
                >
                  + Add FAQ
                </button>
              </div>
              
              {formData.faq.length === 0 ? (
                <div className="bg-surface-50 p-4 rounded-xl text-center">
                  <p className="text-surface-600 text-sm">
                    Add FAQ items to help users understand your workflow
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.faq.map((faq, index) => (
                    <div key={index} className="bg-surface-50 p-4 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">FAQ Item #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeFaqItem(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                          className="w-full bg-white border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                          placeholder="Question"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                          className="w-full bg-white border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 h-20"
                          placeholder="Answer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* How to Make It Work Section */}
            <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">How to Make It Work</h3>
              
              {/* Prerequisites */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-surface-900">Prerequisites</h4>
                
                {/* Required Tools */}
                <div className="mb-4 shadow-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-surface-700">Required Tools</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setShowToolInput(true);
                        setTimeout(() => toolInputRef.current?.focus(), 0);
                      }}
                      className="text-xs text-secondary-600 hover:text-secondary-700"
                    >
                      + Add Tool
                    </button>
                  </div>
                  
                  {formData.how_to_make_it_work.prerequisites.tools.length === 0 ? (
                    <p className="text-sm text-surface-500 italic">No tools specified</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.how_to_make_it_work.prerequisites.tools.map((tool, index) => (
                        <div key={index} className="flex items-center justify-between bg-surface-50 p-2 rounded-lg">
                          <span className="text-sm">{tool}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showToolInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        ref={toolInputRef}
                        type="text"
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        placeholder="Type tool name"
                        className="flex-1 bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTool.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              how_to_make_it_work: {
                                ...prev.how_to_make_it_work,
                                prerequisites: {
                                  ...prev.how_to_make_it_work.prerequisites,
                                  tools: [...prev.how_to_make_it_work.prerequisites.tools, newTool.trim()]
                                }
                              }
                            }));
                            setNewTool('');
                            setShowToolInput(false);
                          }
                        }}
                        className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Subscriptions */}
                <div className="mb-4 shadow-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-surface-700">Subscriptions</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubscriptionInput(true);
                        setTimeout(() => subscriptionInputRef.current?.focus(), 0);
                      }}
                      className="text-xs text-secondary-600 hover:text-secondary-700"
                    >
                      + Add Subscription
                    </button>
                  </div>
                  
                  {formData.how_to_make_it_work.prerequisites.subscriptions.length === 0 ? (
                    <p className="text-sm text-surface-500 italic">No subscriptions specified</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.how_to_make_it_work.prerequisites.subscriptions.map((subscription, index) => (
                        <div key={index} className="flex items-center justify-between bg-surface-50 p-2 rounded-lg">
                          <span className="text-sm">{subscription}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubscription(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showSubscriptionInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        ref={subscriptionInputRef}
                        type="text"
                        value={newSubscription}
                        onChange={(e) => setNewSubscription(e.target.value)}
                        placeholder="Type subscription name"
                        className="flex-1 bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSubscription.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              how_to_make_it_work: {
                                ...prev.how_to_make_it_work,
                                prerequisites: {
                                  ...prev.how_to_make_it_work.prerequisites,
                                  subscriptions: [...prev.how_to_make_it_work.prerequisites.subscriptions, newSubscription.trim()]
                                }
                              }
                            }));
                            setNewSubscription('');
                            setShowSubscriptionInput(false);
                          }
                        }}
                        className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Skills Needed */}
                <div className="mb-4 shadow-card p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2 ">
                    <h5 className="text-sm font-medium text-surface-700">Skills Needed</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillInput(true);
                        setTimeout(() => skillInputRef.current?.focus(), 0);
                      }}
                      className="text-xs text-secondary-600 hover:text-secondary-700"
                    >
                      + Add Skill
                    </button>
                  </div>
                  
                  {formData.how_to_make_it_work.prerequisites.skills.length === 0 ? (
                    <p className="text-sm text-surface-500 italic">No skills specified</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.how_to_make_it_work.prerequisites.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between bg-surface-50 p-2 rounded-lg">
                          <span className="text-sm">{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showSkillInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        ref={skillInputRef}
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Type skill name"
                        className="flex-1 bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSkill.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              how_to_make_it_work: {
                                ...prev.how_to_make_it_work,
                                prerequisites: {
                                  ...prev.how_to_make_it_work.prerequisites,
                                  skills: [...prev.how_to_make_it_work.prerequisites.skills, newSkill.trim()]
                                }
                              }
                            }));
                            setNewSkill('');
                            setShowSkillInput(false);
                          }
                        }}
                        className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Difficulty Level */}
              <div className="mb-6 shadow-card p-4 rounded-xl">
                <h4 className="font-medium mb-3 text-surface-900">Difficulty Level</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-700">Level</label>
                    <select
                      value={formData.how_to_make_it_work.difficulty_level.level}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        how_to_make_it_work: {
                          ...prev.how_to_make_it_work,
                          difficulty_level: {
                            ...prev.how_to_make_it_work.difficulty_level,
                            level: e.target.value as 'beginner' | 'medium' | 'advanced'
                          }
                        }
                      }))}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="medium">Medium</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-700">Setup Time</label>
                    <input
                      type="text"
                      value={formData.how_to_make_it_work.difficulty_level.setupTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        how_to_make_it_work: {
                          ...prev.how_to_make_it_work,
                          difficulty_level: {
                            ...prev.how_to_make_it_work.difficulty_level,
                            setupTime: e.target.value
                          }
                        }
                      }))}
                      placeholder="e.g., 30 minutes"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-700">Learning Curve</label>
                    <input
                      type="text"
                      value={formData.how_to_make_it_work.difficulty_level.learningCurve}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        how_to_make_it_work: {
                          ...prev.how_to_make_it_work,
                          difficulty_level: {
                            ...prev.how_to_make_it_work.difficulty_level,
                            learningCurve: e.target.value
                          }
                        }
                      }))}
                      placeholder="e.g., Moderate, requires basic JavaScript knowledge"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-700">Technical Requirements</label>
                    <input
                      type="text"
                      value={formData.how_to_make_it_work.difficulty_level.technicalRequirements}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        how_to_make_it_work: {
                          ...prev.how_to_make_it_work,
                          difficulty_level: {
                            ...prev.how_to_make_it_work.difficulty_level,
                            technicalRequirements: e.target.value
                          }
                        }
                      }))}
                      placeholder="e.g., Node.js v14+, modern web browser"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-surface-700">Support Availability</label>
                    <input
                      type="text"
                      value={formData.how_to_make_it_work.difficulty_level.supportAvailability}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        how_to_make_it_work: {
                          ...prev.how_to_make_it_work,
                          difficulty_level: {
                            ...prev.how_to_make_it_work.difficulty_level,
                            supportAvailability: e.target.value
                          }
                        }
                      }))}
                      placeholder="e.g., Email support, documentation available"
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                </div>
              </div>
              
              {/* Setup Process */}
              <div className="mb-6 shadow-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-surface-900">Setup Process</h4>
                  <button
                    type="button"
                    onClick={() => setShowSetupStepInput(true)}
                    className="text-sm text-secondary-600 hover:text-secondary-700"
                  >
                    + Add Step
                  </button>
                </div>
                
                {formData.how_to_make_it_work.setup_process.length === 0 ? (
                  <p className="text-sm text-surface-500 italic">No setup steps specified</p>
                ) : (
                  <div className="space-y-4">
                    {formData.how_to_make_it_work.setup_process.map((step, index) => (
                      <div key={index} className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium text-surface-900">Step {index + 1}: {step.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveSetupStep(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-surface-600">{step.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {showSetupStepInput && (
                  <div className="mt-4 bg-surface-50 p-4 rounded-lg border border-surface-200">
                    <h5 className="font-medium mb-2 text-surface-900">Add New Step</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newSetupStep.title}
                        onChange={(e) => setNewSetupStep(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Step title"
                        className="w-full bg-white border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      />
                      <textarea
                        value={newSetupStep.description}
                        onChange={(e) => setNewSetupStep(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Step description"
                        rows={3}
                        className="w-full bg-white border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSetupStepInput(false);
                            setNewSetupStep({ title: '', description: '' });
                          }}
                          className="px-3 py-1.5 bg-surface-200 hover:bg-surface-300 text-surface-700 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddSetupStep}
                          className="px-3 py-1.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg text-sm"
                        >
                          Add Step
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Common Issues & Solutions */}
              <div className="mb-6 shadow-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-surface-900">Common Issues & Solutions</h4>
                  <button
                    type="button"
                    onClick={() => setShowCommonIssueInput(true)}
                    className="text-sm text-secondary-600 hover:text-secondary-700"
                  >
                    + Add Issue
                  </button>
                </div>
                
                {formData.how_to_make_it_work.common_issues.length === 0 ? (
                  <p className="text-sm text-surface-500 italic">No common issues specified</p>
                ) : (
                  <div className="space-y-4">
                    {formData.how_to_make_it_work.common_issues.map((issue, index) => (
                      <div key={index} className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium text-surface-900">{issue.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveCommonIssue(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-surface-600">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {showCommonIssueInput && (
                  <div className="mt-4 bg-surface-50 p-4 rounded-lg border border-surface-200">
                    <h5 className="font-medium mb-2 text-surface-900">Add New Issue</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newCommonIssue.title}
                        onChange={(e) => setNewCommonIssue(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Issue title"
                        className="w-full bg-white border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      />
                      <textarea
                        value={newCommonIssue.description}
                        onChange={(e) => setNewCommonIssue(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Issue description and solution"
                        rows={3}
                        className="w-full bg-white border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCommonIssueInput(false);
                            setNewCommonIssue({ title: '', description: '' });
                          }}
                          className="px-3 py-1.5 bg-surface-200 hover:bg-surface-300 text-surface-700 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCommonIssue}
                          className="px-3 py-1.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg text-sm"
                        >
                          Add Issue
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Key Features
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowFeatureInput(true);
                  setTimeout(() => featureInputRef.current?.focus(), 0);
                }}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-secondary-600 bg-secondary-100 hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Feature
              </button>
            </div>

            <div className="space-y-2">
              {formData.key_features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2 p-4">
                    <span className=''>{feature}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-500 hover:text-red-700 p-4"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {showFeatureInput && (
                  <div className="flex gap-2">
                    <input
                      ref={featureInputRef}
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddFeature();
                        } else if (e.key === 'Escape') {
                          setShowFeatureInput(false);
                          setNewFeature('');
                        }
                      }}
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:secondary-500 ring-secondary-500 sm:text-sm p-3"
                      placeholder="Enter a key feature"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-500-600 hover:bg-secondary-700 bg-secondary-500"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeatureInput(false);
                        setNewFeature('');
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                </div>
              </div>

          <div className='grid grid-cols-2 gap-5 justify-center items-center'>
          {loading ? (
            <div className='flex gap-2 justify-center items-center border-surface-200'>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ):(
          bluePrint ? (
            <div className='rounded-xl'>
              <>
              {thumbnail && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Blueprint:</p>
                  <img src={thumbnail} className="rounded-lg w-full h-auto" />
                </div>
              )}
              {file && (
                <div className="flex flex-col items-center  h-full justify-center p-6 bg-surface-50 rounded-lg border border-surface-200">
                  <FolderOpen className="w-12 h-12 text-green-500 mb-2" />
                    <p className="font-medium text-surface-700 mt-2 text-center">{file.split('/').pop()}</p>
                    <p className="text-sm text-surface-500 my-5">Your file has been uploaded</p>
                </div>
              )}
              </>
              </div>
            ) :(
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center bg-white ${
                dragActive ? 'border-secondary-500 bg-secondary-500/5' : 'border-surface-200'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-surface-400 mb-4" />
              <p className="text-lg mb-2 font-medium">Upload Solution Blue print</p>
              <p className="text-sm text-surface-500 mb-4">or</p>
              <label className="inline-block">
                <span className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileInput('bluePrint', e)}
                  />
              </label>
            </div>
          )
          )}
            {/* thumbnail */}
            {image ? (
              <div className='border rounded-xl'>
                <img className='rounded-xl' src={image} alt="thumbnail" />
              </div> 
              ):(
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center bg-white ${
                  dragActive ? 'border-secondary-500 bg-secondary-500/5' : 'border-surface-200'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-surface-400 mb-4" />
                <p className="text-lg mb-2 font-medium">Upload thumbnail</p>
                <p className="text-sm text-surface-500 mb-4">or</p>
                <label className="inline-block">
                  <span className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e)=> handleFileInput('thumbnail', e)}
                  />
                </label>

              </div>
              )}
          </div>

              {videoLoading ? (
                <div className='flex gap-2 my-5 justify-center items-center border-surface-200'>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading video...</span>
              </div>
              ):(
                demoVideo ? (
                    <div className="border-2 border-dashed border-indigo-500 p-2 rounded-md bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 group-hover:text-indigo-700 transition-colors duration-300">
                      <p>{demoVideo}</p>
                    </div>
                ):(
                <div className="border-2 border-dashed border-indigo-500 rounded-xl p-8 flex flex-col justify-center items-center gap-4 bg-white/50 hover:bg-indigo-50/80 transition-all duration-300 cursor-pointer text-center group"
                  >
                  <label htmlFor='video' className="inline-block">
                    <div className="p-4 w-max mx-auto rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 group-hover:text-indigo-700 transition-colors duration-300">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload Explainer Video</h3>
                      <p className="text-sm text-gray-500">MP4, WebM or MOV. Max 100MB.</p>
                    </div>
                    <input
                      id='video'
                      type="file"
                      className="hidden"
                      multiple
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => handleFileInput('demoVideo', e)}
                    />
                  </label>
                </div>
                )
              )}

            <div className="mt-4 bg-surface-50 p-4 rounded-lg border-2 border-dashed border-surface-200">
              <p className="text-sm font-medium text-surface-900 mb-2">Required Files:</p>
              <ul className="text-sm text-surface-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-500"></div>
                  <span>The complete blueprint (JSON, template file, Git)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-500"></div>
                  <span>How to documentation (PDF)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-500"></div>
                  <span>Explainer video</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-500"></div>
                  <span>Additional thumbnail and visuals</span>
                </li>
              </ul>
            </div>

            <div className="pb-24">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
              >
                Save Solution <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            </form>
          </div>
    </div>
  );
}