import React, { useState, useRef } from 'react';
import {Loader2, Plus, Upload, X, ArrowRight, CheckCircle, Clock, Video, FolderOpen,  Code, Download, Database, Globe, Server } from 'lucide-react';
import type { Product } from '../types';
import {useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function UploadPage() {
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
  const [file, setFile] = useState(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [demoVideo, setDemoVideo] = useState(null)
  
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
  const [newFeature, setNewFeature] = useState('');
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
    status: 'pending',
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
      } else {
        setFile(publicURL.publicUrl);
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
        .upload(fileName, file, {
          contentType: 'video/quicktime', 
        });    
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
    navigate('/dashboard');
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const steps = [
    { name: 'Upload', icon: Upload },
    { name: 'Curation', icon: Clock },
    { name: 'Live', icon: CheckCircle }
  ];

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

  // Add handler functions for How to Make It Work section
  // const handleNewToolKeyDown = (e: React.KeyboardEvent) => {
  //   if (newTool.trim()) {
  //     setFormData(prev => ({
  //       ...prev,
  //       how_to_make_it_work: {
  //         ...prev.how_to_make_it_work,
  //         prerequisites: {
  //           ...prev.how_to_make_it_work.prerequisites,
  //           tools: [...prev.how_to_make_it_work.prerequisites.tools, newTool.trim()]
  //         }
  //       }
  //     }));
  //     setNewTool('');
  //     setShowToolInput(false);
  //   }
  // };

  // const handleNewSubscriptionKeyDown = (e: React.KeyboardEvent) => {
  //   if (newSubscription.trim()) {
  //     setFormData(prev => ({
  //       ...prev,
  //       how_to_make_it_work: {
  //         ...prev.how_to_make_it_work,
  //         prerequisites: {
  //           ...prev.how_to_make_it_work.prerequisites,
  //           subscriptions: [...prev.how_to_make_it_work.prerequisites.subscriptions, newSubscription.trim()]
  //         }
  //       }
  //     }));
  //     setNewSubscription('');
  //     setShowSubscriptionInput(false);
  //   }
  // };

  // const handleNewSkillKeyDown = (e: React.KeyboardEvent) => {
  //   if (newSkill.trim()) {
  //     setFormData(prev => ({
  //       ...prev,
  //       how_to_make_it_work: {
  //         ...prev.how_to_make_it_work,
  //         prerequisites: {
  //           ...prev.how_to_make_it_work.prerequisites,
  //           skills: [...prev.how_to_make_it_work.prerequisites.skills, newSkill.trim()]
  //         }
  //       }
  //     }));
  //     setNewSkill('');
  //     setShowSkillInput(false);
  //   }
  // };

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
          <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Submit Your AI Workflow</h1>
          <p className="text-lg text-surface-600">Share your innovation with the world</p>
        </div>
        
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index + 1 < currentStep 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
                      : index + 1 === currentStep 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white' 
                        : 'bg-surface-100 text-surface-400'
                  }`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="mt-2 text-sm font-medium">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${
                    index + 1 < currentStep 
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500' 
                      : 'bg-surface-100'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {currentStep === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
            <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
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
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  placeholder="Enter tags separated by commas"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
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
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-surface-200 shadow-card p-6">
              <h2 className="text-xl font-bold mb-6 text-surface-900">Review Your Submission</h2>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-surface-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-surface-800">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Title</p>
                      <p className="font-medium text-surface-900">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Price</p>
                      <p className="font-medium text-surface-900">${formData.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Category</p>
                      <p className="font-medium text-surface-900 capitalize">{formData.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Complexity</p>
                      <p className="font-medium text-surface-900 capitalize">{formData.complexity}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-surface-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-surface-800">Description</h3>
                  <p className="text-surface-700 whitespace-pre-wrap">{formData.description}</p>
                </div>

                {/* Tags */}
                <div className="bg-surface-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-surface-800">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-surface-200 text-surface-700 rounded-full text-sm">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements & Integrations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-surface-800">Requirements</h3>
                    {formData.requirements.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.requirements.map((req, index) => (
                          <span key={index} className="px-3 py-1 bg-surface-200 text-surface-700 rounded-full text-sm">
                            {req}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-surface-500 italic">No requirements specified</p>
                    )}
                  </div>

                  <div className="bg-surface-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-surface-800">Integrations</h3>
                    {formData.integrations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.integrations.map((integration, index) => (
                          <span key={index} className="px-3 py-1 bg-surface-200 text-surface-700 rounded-full text-sm">
                            {integration}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-surface-500 italic">No integrations specified</p>
                    )}
                  </div>
                </div>

                {/* Media Files */}
                <div className="bg-surface-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-surface-800">Media Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-surface-500 mb-2">Thumbnail</p>
                      {formData.image && (
                        <img src={formData.image} alt="Thumbnail" className="w-full h-48 object-cover rounded-lg" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-2">Blueprint</p>
                      {formData.bluePrint && (
                        <div className="flex items-center justify-center h-48 bg-surface-100 rounded-lg">
                          <FolderOpen className="w-12 h-12 text-surface-400" />
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-surface-500 mb-2">Demo Video</p>
                      {formData.demoVideo && (
                        <div className="flex items-center justify-center h-48 bg-surface-100 rounded-lg">
                          <Video className="w-12 h-12 text-surface-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* How to Make It Work */}
                <div className="bg-surface-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-surface-800">How to Make It Work</h3>
                  
                  {/* Prerequisites */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-surface-700">Prerequisites</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Tools</p>
                        {formData.how_to_make_it_work.prerequisites.tools.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.how_to_make_it_work.prerequisites.tools.map((tool, index) => (
                              <span key={index} className="px-2 py-1 bg-surface-200 text-surface-700 rounded-full text-xs">
                                {tool}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-surface-500 italic text-sm">No tools specified</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Subscriptions</p>
                        {formData.how_to_make_it_work.prerequisites.subscriptions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.how_to_make_it_work.prerequisites.subscriptions.map((sub, index) => (
                              <span key={index} className="px-2 py-1 bg-surface-200 text-surface-700 rounded-full text-xs">
                                {sub}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-surface-500 italic text-sm">No subscriptions specified</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Skills</p>
                        {formData.how_to_make_it_work.prerequisites.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.how_to_make_it_work.prerequisites.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-surface-200 text-surface-700 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-surface-500 italic text-sm">No skills specified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-surface-700">Difficulty Level</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Level</p>
                        <p className="font-medium capitalize">{formData.how_to_make_it_work.difficulty_level.level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Setup Time</p>
                        <p className="font-medium">{formData.how_to_make_it_work.difficulty_level.setupTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Learning Curve</p>
                        <p className="font-medium">{formData.how_to_make_it_work.difficulty_level.learningCurve}</p>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500 mb-1">Technical Requirements</p>
                        <p className="font-medium">{formData.how_to_make_it_work.difficulty_level.technicalRequirements}</p>
                      </div>
                    </div>
                  </div>

                  {/* Setup Process */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-surface-700">Setup Process</h4>
                    {formData.how_to_make_it_work.setup_process.length > 0 ? (
                      <div className="space-y-2">
                        {formData.how_to_make_it_work.setup_process.map((step, index) => (
                          <div key={index} className="bg-surface-100 p-3 rounded-lg">
                            <p className="font-medium text-surface-800">{step.title}</p>
                            <p className="text-sm text-surface-600">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-surface-500 italic text-sm">No setup steps specified</p>
                    )}
                  </div>

                  {/* Common Issues */}
                  <div>
                    <h4 className="font-medium mb-2 text-surface-700">Common Issues</h4>
                    {formData.how_to_make_it_work.common_issues.length > 0 ? (
                      <div className="space-y-2">
                        {formData.how_to_make_it_work.common_issues.map((issue, index) => (
                          <div key={index} className="bg-surface-100 p-3 rounded-lg">
                            <p className="font-medium text-surface-800">{issue.title}</p>
                            <p className="text-sm text-surface-600">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-surface-500 italic text-sm">No common issues specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">What happens next?</h3>
              <p className="text-blue-700">
                Your submission will be reviewed by our curation team. This process typically takes 1-3 business days.
                You'll receive an email notification once your workflow has been reviewed.
              </p>
            </div>
            
            <div className="flex gap-4 pb-24">
              <button
                onClick={prevStep}
                className="flex-1 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-xl py-3 px-4 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                Submit for Review
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center space-y-6">
            <div className="bg-green-50 p-8 rounded-xl border border-green-100">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Submission Complete!</h2>
              <p className="text-green-700 mb-4">
                Your AI workflow has been submitted for review. Our curation team will evaluate your submission and get back to you within 1-3 business days.
              </p>
            </div>
            
            <div className="pb-24">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl py-3 px-8 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2 font-medium"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}