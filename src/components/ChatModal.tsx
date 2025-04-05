import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, CreditCard, CheckCircle, Shield, Star, MessageSquare } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import type { Product, User, ChatMessage, ConsultationOption } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  user: User | null;
  consultationOptions: ConsultationOption[];
}

export function ChatModal({ isOpen, onClose, product, user, consultationOptions }: ChatModalProps) {
  const [selectedOption, setSelectedOption] = useState<ConsultationOption | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState({
    hours: 1,
    rate: 150,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose);

  // Generate a random creator ID for demo purposes
  const creatorId = 'creator-123';
  const creatorName = product.creator?.creator_name;

  useEffect(() => {
    if (isOpen) {
      // Add initial welcome message
      const initialMessage: ChatMessage = {
        id: 'system-welcome',
        senderId: 'system',
        senderName: 'System',
        receiverId: user?.id || 'guest',
        content: `Welcome to your consultation chat with ${creatorName} about "${product.title}". Please select an option below to get started.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'system'
      };
      
      setMessages([initialMessage]);
    }
  }, [isOpen, product, creatorName, user]);

  const handleOptionSelect = (option: ConsultationOption) => {
    setSelectedOption(option);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      senderId: user?.id || 'guest',
      senderName: user?.name || 'Guest',
      receiverId: creatorId,
      content: option.title,
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'text'
    };
    
    // Add creator response
    const creatorResponse: ChatMessage = {
      id: `creator-${Date.now() + 1}`,
      senderId: creatorId,
      senderName: creatorName,
      receiverId: user?.id || 'guest',
      content: `Thanks for reaching out about "${option.title}". I'd be happy to help you with this. Could you please provide more details about your specific needs?`,
      timestamp: new Date(Date.now() + 1000).toISOString(),
      isRead: false,
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage, creatorResponse]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      senderId: user?.id || 'guest',
      senderName: user?.name || 'Guest',
      receiverId: creatorId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate creator response after a short delay
    setTimeout(() => {
      const creatorResponse: ChatMessage = {
        id: `creator-${Date.now()}`,
        senderId: creatorId,
        senderName: creatorName,
        receiverId: user?.id || 'guest',
        content: "I understand your requirements. I can help you with this project. Would you like me to prepare a proposal with estimated hours and cost?",
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text'
      };
      
      setMessages(prev => [...prev, creatorResponse]);
      
      // Show proposal form option for creator
      if (messages.length > 3 && !showProposalForm) {
        setShowProposalForm(true);
      }
    }, 1000);
  };

  const handleSendProposal = () => {
    setIsSubmitting(true);
    
    // Create proposal message
    const totalCost = proposal.hours * proposal.rate;
    
    const proposalMessage: ChatMessage = {
      id: `proposal-${Date.now()}`,
      senderId: creatorId,
      senderName: creatorName,
      receiverId: user?.id || 'guest',
      content: proposal.description,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'proposal',
      metadata: {
        hours: proposal.hours,
        price: totalCost,
        description: proposal.description,
        paymentStatus: 'pending'
      }
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, proposalMessage]);
      setShowProposalForm(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const handlePayment = (proposalId: string) => {
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Update the proposal message with paid status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === proposalId 
            ? { 
                ...msg, 
                metadata: { 
                  ...msg.metadata, 
                  paymentStatus: 'paid',
                  paymentId: `pay_${Date.now()}`
                } 
              } 
            : msg
        )
      );
      
      // Add system message about payment
      const paymentMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        receiverId: user?.id || 'guest',
        content: `Payment successful! ${creatorName} will now begin working on your request.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'system'
      };
      
      setMessages(prev => [...prev, paymentMessage]);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCompleteOrder = () => {
    // Add completion message
    const completionMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      senderId: creatorId,
      senderName: creatorName,
      receiverId: user?.id || 'guest',
      content: "I've completed the work as discussed. Please review and confirm completion.",
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setShowCompletionConfirmation(true);
  };

  const confirmOrderCompletion = () => {
    // Add system message about completion
    const completionConfirmation: ChatMessage = {
      id: `system-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      receiverId: user?.id || 'guest',
      content: "Order completed successfully! Thank you for using our platform.",
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };
    
    setMessages(prev => [...prev, completionConfirmation]);
    setOrderCompleted(true);
    setShowCompletionConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-xl border border-surface-200 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-surface-200 flex items-center justify-between bg-gradient-to-r from-primary-600 to-secondary-500">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-secondary-500 font-semibold">
                {creatorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{creatorName}</h3>
              <p className="text-sm text-white/80">Consultation about {product.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-xl p-3 ${
                  message.type === 'system' 
                    ? 'bg-surface-100 text-surface-600' 
                    : message.senderId === user?.id 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                      : 'bg-surface-100 text-surface-900'
                }`}
              >
                {message.type !== 'system' && message.senderId !== user?.id && (
                  <p className="text-xs text-surface-500 mb-1">{message.senderName}</p>
                )}
                
                {message.type === 'proposal' ? (
                  <div className="space-y-2">
                    <div className="bg-white rounded-xl p-4 border border-surface-200">
                      <h4 className="font-medium mb-2">Consultation Proposal</h4>
                      <p className="text-sm mb-2">{message.content}</p>
                      <div className="flex justify-between text-sm">
                        <span>Hours: {message.metadata?.hours}</span>
                        <span>Rate: ${proposal.rate}/hr</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-surface-200 flex justify-between items-center">
                        <span className="font-bold">${message.metadata?.price}</span>
                        {message.metadata?.paymentStatus === 'pending' ? (
                          <button
                            onClick={() => handlePayment(message.id)}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                            Pay Now
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-lg text-sm flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Option Selection */}
          {!selectedOption && (
            <div className="space-y-2 mt-4">
              {consultationOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full p-4 bg-surface-100 hover:bg-surface-200 rounded-xl text-left transition-colors"
                >
                  <h4 className="font-medium">{option.title}</h4>
                  <p className="text-sm text-surface-600">{option.description}</p>
                </button>
              ))}
            </div>
          )}
          
          {/* Order Completion Confirmation */}
          {showCompletionConfirmation && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-surface-900 mb-3">The creator has marked this order as complete. Please confirm if you're satisfied with the work.</p>
              <button
                onClick={confirmOrderCompletion}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Confirm Completion
              </button>
            </div>
          )}
        </div>
        
        {/* Creator Proposal Form */}
        {showProposalForm && (
          <div className="p-4 border-t border-surface-200 bg-surface-50">
            <h4 className="font-medium mb-2">Send Proposal</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={proposal.hours}
                    onChange={(e) => setProposal(prev => ({ ...prev, hours: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white border border-surface-200 rounded-lg py-2 px-3 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rate ($/hr)</label>
                  <input
                    type="number"
                    min="1"
                    value={proposal.rate}
                    onChange={(e) => setProposal(prev => ({ ...prev, rate: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white border border-surface-200 rounded-lg py-2 px-3 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={proposal.description}
                  onChange={(e) => setProposal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white border border-surface-200 rounded-lg py-2 px-3 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 h-20"
                  placeholder="Describe what you'll deliver..."
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Total: ${proposal.hours * proposal.rate}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProposalForm(false)}
                    className="px-4 py-2 bg-surface-200 hover:bg-surface-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendProposal}
                    disabled={isSubmitting || !proposal.description}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Send Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Complete Order Button (for creator) */}
        {messages.some(m => m.type === 'proposal' && m.metadata?.paymentStatus === 'paid') && 
         !orderCompleted && 
         !showCompletionConfirmation && (
          <div className="p-4 border-t border-surface-200">
            <button
              onClick={handleCompleteOrder}
              className="w-full py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Mark Order as Complete
            </button>
          </div>
        )}
        
        {/* Input Area */}
        {selectedOption && !orderCompleted && !showProposalForm && (
          <div className="p-4 border-t border-surface-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-surface-50 border border-surface-200 rounded-xl py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}