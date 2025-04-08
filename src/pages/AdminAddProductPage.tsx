import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Shield, Search, Plus, X, User, AlertCircle, LogOut, UserPlus, ArrowRight, Upload, FolderOpen,  } from 'lucide-react';
import {Loader2, Upload, X, ArrowRight, CheckCircle, Clock, AlertCircle, Video, FolderOpen, Shield,  Code, Download, Database, Globe, Server, Search, Plus, User,  } from 'lucide-react';
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
  // const { user } = useAuth();
  // const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatorSearch, setShowCreatorSearch] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [registeredUser, setRegisteredUser] = useState<any[]>([])
  
  const [newCreator, setNewCreator] = useState<Creator>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    isUnclaimed: true
  });

  const [showNewCreatorForm, setShowNewCreatorForm] = useState(false);
  // const [formData, setFormData] = useState({
  //   title: '',
  //   description: '',
  //   price: '',
  //   category: 'automation',
  //   tags: '',
  //   image: '',
  //   requirements: [] as string[],
  //   integrations: [] as string[],
  //   complexity: 'medium' as 'beginner' | 'medium' | 'advanced',
  //   faq: [] as { question: string; answer: string }[],
  //   consultationAvailable: false,
  //   consultationRate: '',
  //   thumbnail: null as File | null,
  //   mainImage: null as File | null,
  //   video: null as File | null,
  //   status: 'approved',
  // });



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
      faq: [] as { question: string; answer: string }[],
      creatorBio: '',
      consultationAvailable: false,
      consultationRate: '',
      status: 'pending',
      demoVideo: ''
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



  // Handle file selection
  // const handleFileSelect = async (type: 'thumbnail' | 'mainImage' | 'video' | 'files', files: FileList | null) => {
  //   if (!files) return;
  //   console.log("type", type, "files", files );
    
  //   switch (type) {
  //     case 'thumbnail':{
  //       const dotIndex = files[0].name.lastIndexOf('.');
  //       const fileName = `thumbnails/${user?.id}/${files[0].name.substring(0, dotIndex)}${new Date().getMilliseconds()}${files[0].name.substring(dotIndex)}`;
  //       console.log("fileName", fileName);
        
  //       const { data, error } = await supabase
  //       .storage
  //       .from('solutions-images')
  //       .upload(fileName, files[0], {
  //         cacheControl: '3600',
  //         upsert: false
  //       })
  //       if(error){
  //         console.error("error while uploading image", error);
  //         return
  //       }
  //       const { data:urlData } = supabase
  //       .storage
  //       .from('solutions-images')
  //       .getPublicUrl(fileName)

  //       setFormData(prev => ({ ...prev, thumbnail: urlData.publicUrl }));
  //       break;
  //     }
  //     case 'mainImage':{
  //       const dotIndex = files[0].name.lastIndexOf('.');
  //       const fileName = `mainImage/${user?.id}/${files[0].name.substring(0, dotIndex)}${new Date().getMilliseconds()}${files[0].name.substring(dotIndex)}`;

  //       const { data, error } = await supabase
  //       .storage
  //       .from('solutions-images')
  //       .upload(fileName, files[0], {
  //         cacheControl: '3600',
  //         upsert: false
  //       })
  //       if(error){
  //         console.error("error while uploading image", error);
  //         return
  //       }
  //       const { data:urlData } = supabase
  //       .storage
  //       .from('solutions-images')
  //       .getPublicUrl(fileName)

  //       setFormData(prev => ({ ...prev, mainImage: urlData.publicUrl }));
  //       break;
  //     }
  //     case 'video':{
  //       const dotIndex = files[0].name.lastIndexOf('.');
  //       const fileName = `solution-videos/${user?.id}/${files[0].name.substring(0, dotIndex)}${new Date().getMilliseconds()}${files[0].name.substring(dotIndex)}`;

  //       const { data, error } = await supabase
  //       .storage
  //       .from('solutions-images')
  //       .upload(fileName, files[0], {
  //         cacheControl: '3600',
  //         upsert: false
  //       })
  //       if(error){
  //         console.error("error while uploading image", error);
  //         return
  //       }
  //       const { data:urlData } = supabase
  //       .storage
  //       .from('solutions-images')
  //       .getPublicUrl(fileName)

  //       setFormData(prev => ({ ...prev, video: urlData.publicUrl }));
  //       break;
  //     }
  //     case 'files': {
  //       const originalName = files[0].name;
  //       const dotIndex = originalName.lastIndexOf('.');
  //       const baseName = originalName.substring(0, dotIndex).replace(/\s+/g, '_');
  //       const extension = originalName.substring(dotIndex);
  //       const fileKey = `files/${user?.id}/${baseName}${new Date().getMilliseconds()}${extension}`;
        
  //       console.log("fileKey", fileKey);
        
  //       const { data, error } = await supabase
  //         .storage
  //         .from('solutions-images')
  //         .upload(fileKey, files[0], {
  //           cacheControl: '3600',
  //           upsert: false
  //         });
  //       if (error) {
  //         console.error("Error while uploading file", error);
  //         return;
  //       }
        
  //       const { data: urlData } = supabase
  //         .storage
  //         .from('solutions-images')
  //         .getPublicUrl(fileKey);
        
  //       // Store both the key and the URL
  //       setFormData(prev => ({
  //         ...prev,
  //         files: [...prev.files, { key: fileKey, url: urlData.publicUrl }]
  //       }));
  //       break;
  //     }}      
  // };
  
  // const handleFileRemove = async (fileKey: string, index?: number) => {

  //   const { data, error } = await supabase
  //     .storage
  //     .from('solutions-images')
  //     .remove([fileKey]);
  //   if (error) {
  //     console.error("Error deleting file", error);
  //     return false;
  //   }
  //   console.log("File deleted", data);
  //   return true;
  // };
  
  
  // // Handle adding FAQ
  // const handleAddFaq = () => {
  //   if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

  //   setFormData(prev => ({
  //     ...prev,
  //     faq: [...prev.faq, { question: newFaqQuestion, answer: newFaqAnswer }]
  //   }));
  //   setNewFaqQuestion('');
  //   setNewFaqAnswer('');
  // };

  // // Handle removing FAQ
  // const handleRemoveFaq = (index: number) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     faq: prev.faq.filter((_, i) => i !== index)
  //   }));
  // };

  // // Handle adding requirement
  // const handleAddRequirement = () => {
  //   if (!newRequirement.trim()) return;
  //   setFormData(prev => ({
  //     ...prev,
  //     requirements: [...prev.requirements, newRequirement]
  //   }));
  //   setNewRequirement('');
  // };

  // // Handle adding integration
  // const handleAddIntegration = () => {
  //   if (!newIntegration.trim()) return;
  //   setFormData(prev => ({
  //     ...prev,
  //     integrations: [...prev.integrations, newIntegration]
  //   }));
  //   setNewIntegration('');
  // };

  // // Redirect if not admin
  // if (!user || user.role !== 'admin') {
  //   return (
  //     <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
  //       <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-card max-w-md text-center">
  //         <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-2xl font-bold mb-2 text-surface-900">Access Denied</h2>
  //         <p className="text-surface-600 mb-6">
  //           You don't have permission to access the admin panel.
  //         </p>
  //         <button
  //           onClick={() => navigate('/')}
  //           className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg py-3 px-8 transition-all duration-200 shadow-lg hover:shadow-xl"
  //         >
  //           Return to Home
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }
  // const handleSubmit = async(e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Handle form submission
  //   console.log('Form submitted:', { ...formData, creator: selectedCreator || newCreator });
  //   const priceValue = formData.price.trim() !== '' ? parseFloat(formData.price) : null;
  //   const consultationRateValue = formData.consultationRate.trim() !== '' ? parseFloat(formData.consultationRate) : null;

  //   const { error } = await supabase
  //     .from('solutions')
  //     .insert([
  //       { 
  //         title: formData.title,
  //         description: formData.description,
  //         price: priceValue,
  //         category: formData.category,
  //         image: formData.image,
  //         tags: formData.tags.split(',').map(tag => tag.trim()),
  //         complexity: formData.complexity,
  //         integrations: formData.integrations,
  //         faq: formData.faq,
  //         consultationAvailable: formData.consultationAvailable,
  //         consultationRate: consultationRateValue,
  //         status: formData.status,
  //         // creator: {creator_name: selectedCreator?.username, creator_id: selectedCreator.id, creatorBio: selectedCreator?.bio},
  //         creator: selectedCreator ? { creator_name: selectedCreator.username, creator_id: selectedCreator.id, creatorBio: selectedCreator.bio}: null,
  //         thumbnail: formData.thumbnail,
  //         video: formData.video,
  //         files: formData.files,
  //       }
  //     ])
  
  //     if(error){
  //       console.error('error', error);
  //     }else{
  //     console.log("✅ solutions added");``
  //     }
  //     // navigate('/marketplace');
  // };

  // const filteredUsers = registeredUser.filter(user =>
  //   user.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // const handleSelectUser = (user: typeof REGISTERED_USERS[0]) => {
  // console.log("user name handleSelectUser", user);
  
  //   setSelectedCreator({
  //     id: user.id,
  //     username: user.email.split('@')[0],
  //     bio: '',
  //     isUnclaimed: false
  //   });
  //   setShowCreatorSearch(false);
  // };

  // const handleCreateNewCreator = () => {
  //   if (!newCreator.firstName.trim() || !newCreator.lastName.trim() || !newCreator.username.trim() || !newCreator.bio.trim()) return;
    
  //   // In a real app, this would:
  //   // 1. Create the unclaimed user account
  //   // 2. Mark the account as unclaimed in the database
    
  //   setSelectedCreator({
  //     ...newCreator,
  //     isUnclaimed: true
  //   });
  //   setShowNewCreatorForm(false);
  // };

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
    setShowNewCreatorForm(false);
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
        faq: formData.faq,
        consultationAvailable: formData.consultationAvailable,
        consultationRate: consultationRateValue,
        status: formData.status,
        creator: {creator_name: user?.name, creator_id: user.id, creator_title: user?.title, creator_bio: user?.bio},
        image: formData.image,
        bluePrint: formData.bluePrint ,
        demoVideo: formData.demoVideo
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
  

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-white relative">
      {/* <div className="relative">
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

          <AdminNav />

          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
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

              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h2 className="text-xl font-semibold mb-4">Media & Files</h2>
                <div className="space-y-6">
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
      </div>  */}
      
      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4 m">Submit Your AI Workflow</h1>
          <p className="text-lg text-surface-600">Share your innovation with the world</p>
        </div>
        
        <form onSubmit={(e) => { handleSubmit(e) }} className="space-y-6">
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
                <label className="block text-sm font-medium mb-2">Tags <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  placeholder="Enter tags separated by commas"
                  required
                />
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
                  <p className="text-sm font-medium mb-2">Thumbnail:</p>
                  <img src={thumbnail} className="rounded-lg w-full h-auto" />
                </div>
              )}
              {videoUrl && (
                <div className="flex flex-col items-center  h-full justify-center p-6 bg-surface-50 rounded-lg border border-surface-200">
                  <FolderOpen className="w-12 h-12 text-green-500 mb-2" />
                  <p className="font-medium text-surface-700 mt-2 text-center">{videoUrl.split('/').pop()}</p>
                  <p className="text-sm text-surface-500 my-5">Your video has been uploaded</p>
                </div>
              )}
              {zipUrl && (
                <div>
                  <div className="flex flex-col items-center bg-blue-50 h-full justify-center p-6 rounded-lg border border-surface-200">
                     <p className="text-sm font-medium mb-2">ZIP File:</p>
                     <FolderOpen className="w-12 h-12 text-blue-500 mb-2" />
                     <p className="font-medium text-surface-700 mt-2 text-center">{zipUrl.split('/').pop()}</p>
                     <p className="text-sm text-surface-500 my-4">Your video has been uploaded</p>
                  </div>
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
                Continue Solution<ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
          </div>
    </div>
  );
}