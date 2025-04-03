import React, { useState, useRef } from 'react';
import { Upload, X, ArrowRight, CheckCircle, Clock, Video, Code, Database, Globe, Server } from 'lucide-react';
import type { Product } from '../types';
import {useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState('');
  const [newIntegration, setNewIntegration] = useState('');
  const [showRequirementInput, setShowRequirementInput] = useState(false);
  const [showIntegrationInput, setShowIntegrationInput] = useState(false);
  const requirementInputRef = useRef<HTMLInputElement>(null);
  const integrationInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'automation' as Product['category'],
    tags: '',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80',
    videoUrl: '',
    complexity: 'medium' as 'beginner' | 'medium' | 'advanced',
    integrations: [] as string[],
    requirements: [] as string[],
    faq: [] as { question: string; answer: string }[],
    creatorBio: '',
    consultationAvailable: false,
    consultationRate: '',
    status: 'pending',
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
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
        image: formData.image,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        complexity: formData.complexity,
        integrations: formData.integrations,
        faq: formData.faq,
        creatorBio: formData.creatorBio,
        consultationAvailable: formData.consultationAvailable,
        consultationRate: consultationRateValue,
        status: formData.status
      }
    ])

    if(error){
      console.error('error', error);
    }
    console.log("✅ solutions added");
    navigate('/marketplace');
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
              <p className="text-lg mb-2 font-medium">Drag and drop your files here</p>
              <p className="text-sm text-surface-500 mb-4">or</p>
              <label className="inline-block">
                <span className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileInput}
                />
              </label>
            </div>

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
            
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-surface-200"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-surface-400 hover:text-surface-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
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
              <h2 className="text-xl font-bold mb-4">Review Your Submission</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-surface-500">Title</div>
                  <div className="col-span-2 font-medium">{formData.title}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-surface-500">Description</div>
                  <div className="col-span-2">{formData.description}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-surface-500">Price</div>
                  <div className="col-span-2">${formData.price}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-surface-500">Category</div>
                  <div className="col-span-2 capitalize">{formData.category}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-surface-500">Tags</div>
                  <div className="col-span-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <span key={index} className="inline-block bg-surface-100 text-surface-700 px-2 py-1 rounded-full text-xs mr-2 mb-2">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                
                {formData.requirements.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-surface-500">Requirements</div>
                    <div className="col-span-2">
                      {formData.requirements.map((req, index) => (
                        <span key={index} className="inline-block bg-surface-100 text-surface-700 px-2 py-1 rounded-full text-xs mr-2 mb-2">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.integrations.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-surface-500">Integrations</div>
                    <div className="col-span-2">
                      {formData.integrations.map((integration, index) => (
                        <span key={index} className="inline-block bg-surface-100 text-surface-700 px-2 py-1 rounded-full text-xs mr-2 mb-2">
                          {integration}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-surface-500">Files</div>
                  <div className="col-span-2">
                    {files.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {files.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-surface-400">No files uploaded</span>
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