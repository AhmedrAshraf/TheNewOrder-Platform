import React, { useState } from 'react';
import { HelpCircle, Book, MessageCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function HelpPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqs: FAQItem[] = [
    {
      question: 'How do I submit my AI workflow?',
      answer: 'To submit your AI workflow, click on the "Submit AI Workflow" button in the navigation bar. You\'ll need to create an account or sign in first. Then, follow the three-step process to upload your workflow, provide details, and submit it for review.'
    },
    {
      question: 'How long does the review process take?',
      answer: 'Our curation team typically reviews submissions within 1-3 business days. You\'ll receive an email notification once your workflow has been reviewed with the decision and any feedback.'
    },
    {
      question: 'What are the requirements for AI workflows?',
      answer: 'AI workflows should be original, functional, and provide value to users. They should include clear documentation, be free of malware or harmful code, and comply with our terms of service. The more detailed and well-documented your submission, the faster the review process.'
    },
    {
      question: 'How do payments work?',
      answer: 'When a user purchases your workflow, the payment is processed securely through Stripe. We take a 15% platform fee, and the remaining 85% is paid out to you. Payments are processed monthly for all sales from the previous month.'
    },
    {
      question: 'Can I update my workflow after it\'s been approved?',
      answer: 'Yes, you can submit updates to your workflow at any time. Major updates will go through a review process again, while minor updates like description changes or bug fixes are typically approved automatically.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can contact our support team by emailing support@pulsar.ai or by using the chat widget in the bottom right corner of the screen. Our support hours are Monday to Friday, 9am to 5pm EST.'
    }
  ];

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'faq' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'docs' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Documentation
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'contact' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Contact Us
            </button>
          </div>
        </div>
        
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-purple-400" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedFAQ === index && (
                    <div className="p-4 pt-0 text-gray-300 border-t border-gray-800">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">Still have questions?</p>
              <button
                onClick={() => setActiveTab('contact')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'docs' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Book className="h-6 w-6 text-purple-400" />
              Documentation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
                <p className="text-gray-400 mb-4">
                  Learn the basics of using Pulsar and how to navigate the platform.
                </p>
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Read Guide →
                </a>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3">Workflow Submission</h3>
                <p className="text-gray-400 mb-4">
                  Detailed guide on how to prepare and submit your AI workflows.
                </p>
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Read Guide →
                </a>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3">API Documentation</h3>
                <p className="text-gray-400 mb-4">
                  Technical documentation for integrating with the Pulsar API.
                </p>
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Read Guide →
                </a>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3">Billing & Payments</h3>
                <p className="text-gray-400 mb-4">
                  Information about payment processing, fees, and payouts.
                </p>
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Read Guide →
                </a>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-purple-900/30 border border-purple-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Developer Resources</h3>
              <p className="text-gray-300 mb-4">
                Access our SDK, code samples, and developer tools to build and integrate with Pulsar.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  JavaScript SDK
                </a>
                <a href="#" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  Python SDK
                </a>
                <a href="#" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  Code Samples
                </a>
                <a href="#" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  Webhooks
                </a>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'contact' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-purple-400" />
              Contact Support
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Email Support</h3>
                <p className="text-gray-400 mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <a href="mailto:support@pulsar.ai" className="text-purple-400 hover:text-purple-300">
                  support@pulsar.ai
                </a>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Live Chat</h3>
                <p className="text-gray-400 mb-4">
                  Chat with our support team during business hours.
                </p>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                  Start Chat
                </button>
              </div>
            </div>
            
            <form className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
              <h3 className="text-xl font-semibold mb-3">Send a Message</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Feature Request</option>
                  <option>Report a Bug</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 h-32"
                  placeholder="How can we help you?"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 px-4 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}