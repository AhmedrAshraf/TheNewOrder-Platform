import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Clock, Filter, Search, Eye, ArrowUpDown,
  MessageCircle, Star, Tag, Calendar, Save, Bell, Edit, Shield
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { QuantumBackground } from '../components/QuantumBackground';
import { AdminNav } from '../components/AdminNav';
import type { Workflow, AuthState } from '../types';
import { useAuth } from "../context/AuthContext";

// Sample workflows for demonstration
const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: 'wf1',
    title: 'Email Marketing Automation',
    description: 'Automate your email marketing campaigns with AI-powered content generation and scheduling',
    price: 299,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80',
    creator: 'marketing_guru',
    category: 'automation',
    tags: ['email', 'marketing', 'automation'],
    status: 'pending',
    submittedAt: '2025-06-10T14:30:00Z'
  },
  {
    id: 'wf2',
    title: 'Social Media Content Generator',
    description: 'Generate engaging social media content across multiple platforms with one click',
    price: 199,
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80',
    creator: 'social_ai',
    category: 'automation',
    tags: ['social-media', 'content', 'ai'],
    status: 'approved',
    submittedAt: '2025-06-08T09:15:00Z',
    reviewedAt: '2025-06-09T11:20:00Z',
    reviewedBy: 'admin'
  },
  {
    id: 'wf3',
    title: 'Customer Support Chatbot',
    description: 'AI-powered chatbot for 24/7 customer support with natural language processing',
    price: 499,
    image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80',
    creator: 'support_ai',
    category: 'integration',
    tags: ['chatbot', 'support', 'ai'],
    status: 'rejected',
    submittedAt: '2025-06-07T16:45:00Z',
    reviewedAt: '2025-06-09T10:30:00Z',
    reviewedBy: 'admin',
    rejectionReason: 'Similar product already exists. Please differentiate your offering.'
  }
];

export function AdminCurationPage() {
    const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>(SAMPLE_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [curatorNotes, setCuratorNotes] = useState<string>('');
  const [showNotesHistory, setShowNotesHistory] = useState<boolean>(false);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

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

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesSearch = 
      workflow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.creator.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const approveWorkflow = (id: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { 
              ...workflow, 
              status: 'approved', 
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.name || 'admin',
              curatorNotes: curatorNotes || undefined
            } 
          : workflow
      )
    );

    // Add notification for the workflow creator
    addNotification({
      type: 'creator',
      title: 'Workflow Approved',
      message: `Your workflow "${selectedWorkflow?.title}" has been approved`,
      link: '/dashboard'
    });

    setSelectedWorkflow(null);
    setCuratorNotes('');
  };

  const rejectWorkflow = (id: string) => {
    if (!rejectionReason.trim()) return;
    
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { 
              ...workflow, 
              status: 'rejected', 
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.name || 'admin',
              rejectionReason,
              curatorNotes: curatorNotes || undefined
            } 
          : workflow
      )
    );

    // Add notification for the workflow creator
    addNotification({
      type: 'creator',
      title: 'Workflow Rejected',
      message: `Your workflow "${selectedWorkflow?.title}" has been rejected`,
      link: '/dashboard'
    });

    setRejectionReason('');
    setShowRejectionModal(false);
    setSelectedWorkflow(null);
    setCuratorNotes('');
  };

  const openRejectionModal = () => {
    setShowRejectionModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-surface-200 text-surface-600 text-xs rounded-full">{status}</span>;
    }
  };

  // Sample curation history for demonstration
  const curationHistory = [
    { 
      date: '2025-06-10T15:30:00Z', 
      curator: 'admin', 
      action: 'Added note', 
      note: 'Initial review: Looks promising but need to check for similar existing products.' 
    },
    { 
      date: '2025-06-10T16:45:00Z', 
      curator: 'content_reviewer', 
      action: 'Added note', 
      note: 'Content seems original. Pricing is appropriate for the feature set.' 
    },
    { 
      date: '2025-06-11T09:15:00Z', 
      curator: 'tech_reviewer', 
      action: 'Added note', 
      note: 'Technical implementation looks solid. API documentation is comprehensive.' 
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <QuantumBackground intensity="low" className="absolute inset-0 pointer-events-none" overlay={true} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-surface-900">Solution Curation</h1>
              <p className="text-surface-600">Review and manage solution submissions</p>
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

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full md:w-64 space-y-4">
              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" /> Filters
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === 'all' 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                        : 'hover:bg-surface-100'
                    }`}
                  >
                    All Submissions
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === 'pending' 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                        : 'hover:bg-surface-100'
                    }`}
                  >
                    Pending Review
                  </button>
                  <button
                    onClick={() => setFilterStatus('approved')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === 'approved' 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                        : 'hover:bg-surface-100'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setFilterStatus('rejected')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === 'rejected' 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                        : 'hover:bg-surface-100'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5" /> Search
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search submissions..."
                    className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                <h3 className="text-lg font-semibold mb-4">Curation Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-surface-600 text-sm">Pending Review</p>
                    <p className="text-2xl font-bold">{workflows.filter(w => w.status === 'pending').length}</p>
                  </div>
                  <div>
                    <p className="text-surface-600 text-sm">Approved Today</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div>
                    <p className="text-surface-600 text-sm">Rejected Today</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                  <div>
                    <p className="text-surface-600 text-sm">Avg. Review Time</p>
                    <p className="text-2xl font-bold">1.2 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {selectedWorkflow ? (
                <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold font-poppins">{selectedWorkflow.title}</h2>
                    <button
                      onClick={() => setSelectedWorkflow(null)}
                      className="p-2 hover:bg-surface-100 rounded-lg"
                    >
                      <XCircle className="h-5 w-5 text-surface-400" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-1">
                      <img
                        src={selectedWorkflow.image}
                        alt={selectedWorkflow.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="mt-4 space-y-2">
                        <div>
                          <p className="text-surface-600 text-sm">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedWorkflow.status)}</div>
                        </div>
                        <div>
                          <p className="text-surface-600 text-sm">Submitted By</p>
                          <p className="font-medium">{selectedWorkflow.creator}</p>
                        </div>
                        <div>
                          <p className="text-surface-600 text-sm">Submitted On</p>
                          <p className="font-medium">
                            {new Date(selectedWorkflow.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-surface-600 text-sm">Price</p>
                          <p className="font-medium">${selectedWorkflow.price}</p>
                        </div>
                        <div>
                          <p className="text-surface-600 text-sm">Rating</p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-surface-300'}`}
                                fill={i < 4 ? 'currentColor' : 'none'}
                              />
                            ))}
                            <span className="ml-2 text-sm">4.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-surface-600">{selectedWorkflow.description}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Category</h3>
                        <p className="text-surface-600 capitalize">{selectedWorkflow.category}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedWorkflow.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-surface-100 text-surface-600 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {selectedWorkflow.status === 'rejected' && selectedWorkflow.rejectionReason && (
                        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                          <h3 className="text-lg font-semibold mb-2">Rejection Reason</h3>
                          <p className="text-surface-600">{selectedWorkflow.rejectionReason}</p>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">Curator Notes</h3>
                          <button 
                            onClick={() => setShowNotesHistory(!showNotesHistory)}
                            className="text-sm text-secondary-500 hover:text-secondary-600"
                          >
                            {showNotesHistory ? 'Hide History' : 'View History'}
                          </button>
                        </div>
                        
                        {showNotesHistory ? (
                          <div className="space-y-4 mb-4">
                            {curationHistory.map((entry, index) => (
                              <div key={index} className="bg-surface-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{entry.curator}</span>
                                  <span className="text-xs text-surface-400">
                                    {new Date(entry.date).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-surface-600">{entry.note}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={curatorNotes}
                            onChange={(e) => setCuratorNotes(e.target.value)}
                            className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 h-32 mb-4"
                            placeholder="Add your notes about this workflow..."
                          />
                        )}
                      </div>
                      
                      {selectedWorkflow.status === 'pending' && (
                        <div className="flex gap-4 mt-6">
                          <button
                            onClick={() => approveWorkflow(selectedWorkflow.id)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="h-5 w-5" /> Approve
                          </button>
                          <button
                            onClick={openRejectionModal}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <XCircle className="h-5 w-5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {filterStatus === 'all' ? 'All Submissions' : 
                       filterStatus === 'pending' ? 'Pending Review' :
                       filterStatus === 'approved' ? 'Approved Submissions' : 'Rejected Submissions'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <select 
                        className="bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 text-sm"
                        defaultValue="newest"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="price-low">Price: Low to High</option>
                      </select>
                      <button className="p-2 hover:bg-surface-100 rounded-lg">
                        <ArrowUpDown className="h-5 w-5 text-surface-400" />
                      </button>
                    </div>
                  </div>
                  
                  {filteredWorkflows.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-surface-200 shadow-card">
                      <p className="text-surface-600">No submissions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredWorkflows.map((workflow) => (
                        <div
                          key={workflow.id}
                          className="bg-white rounded-xl p-4 border border-surface-200 hover:border-secondary-500/50 transition-all duration-300 cursor-pointer shadow-card hover:shadow-card-hover"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={workflow.image}
                              alt={workflow.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{workflow.title}</h3>
                                {getStatusBadge(workflow.status)}
                              </div>
                              <p className="text-sm text-surface-600 line-clamp-1">{workflow.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-surface-500">
                                    By {workflow.creator}
                                  </span>
                                  <span className="text-sm text-surface-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(workflow.submittedAt).toLocaleDateString()}
                                  </span>
                                  <span className="text-sm font-medium">${workflow.price}</span>
                                </div>
                                <button className="p-1 hover:bg-surface-100 rounded-full">
                                  <Eye className="h-4 w-4 text-surface-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md relative border border-surface-200 shadow-xl">
            <button
              onClick={() => setShowRejectionModal(false)}
              className="absolute right-4 top-4 text-surface-400 hover:text-surface-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Reject Submission</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Rejection</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 h-32"
                  placeholder="Provide a reason for rejection..."
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg py-3 px-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedWorkflow && rejectWorkflow(selectedWorkflow.id)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}