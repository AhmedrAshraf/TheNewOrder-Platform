import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, DollarSign, Star, Users, TrendingUp, Shield, 
  Bell, ChevronRight, ArrowUp, ArrowDown, Clock, X
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { AdminNav } from '../components/AdminNav';
import type { Workflow, User, AuthState } from '../types';
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';

export function AdminPage() {
  const navigate = useNavigate();
    const { user } = useAuth();
  
  const { addNotification } = useNotifications();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [solution, setSolution] = useState([])
  const [pendingList, setPendingList] = useState([])
  
  const fetchUser = async () => {
    const { data, error } = await supabase
      .from('users')
      .select();

    if (error) {
      console.log("error", error);
      return [];
    } else {
      return data || [];
    }
  };
  fetchUser().then(fetchedUsers => setUsers(fetchedUsers.length));

  const fetchSolution = async () => {
    const { data, error } = await supabase
      .from('solutions')
      .select();

    if (error) {
      console.log("error", error);
      return [];
    } else {
      return data || [];
    }
  };
  fetchSolution().then(fetchedSolution => setSolution(fetchedSolution.length));

  const fetchPendingReviews = async () => {
    const { data, error } = await supabase
      .from('solutions')
      .select()
      .eq('status', 'pending');

    if (error) {
      console.log("error", error);
      return [];
    } else {
      return data || [];
    }
  };
  fetchPendingReviews().then(pendingReviews => setPendingList(pendingReviews.length));

  const handleCreateAnnouncement = () => {
    setShowAnnouncementModal(true);
  };

  const handleSubmitAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    // Create the announcement notification
    addNotification({
      type: 'system',
      title: announcementTitle,
      message: announcementMessage,
      link: '/blog/announcements'
    });

    // Reset form and close modal
    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setShowAnnouncementModal(false);
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

  // Admin dashboard stats
  const stats = [
    { label: 'Total Users', value: users, icon: Users, change: '+12%', color: 'from-blue-500 to-blue-700' },
    { label: 'Total Solutions', value: solution, icon: Package, change: '+8%', color: 'from-purple-500 to-purple-700' },
    { label: 'Revenue', value: '$48,290', icon: DollarSign, change: '+24%', color: 'from-green-500 to-green-700' },
    { label: 'Pending Reviews', value: pendingList, icon: Clock, change: '-3%', color: 'from-yellow-500 to-yellow-700' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-surface-900">Admin Dashboard</h1>
              <p className="text-surface-600">Welcome back, {user.name}</p>
            </div>
            <button 
              onClick={handleCreateAnnouncement}
              className="px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <Bell className="h-4 w-4" /> Create Announcement
            </button>
          </div>

          {/* Admin Navigation */}
          <AdminNav />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-surface-200 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-sm ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  } flex items-center gap-1`}>
                    {stat.change.startsWith('+') ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-surface-900">{stat.value}</h3>
                <p className="text-surface-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Submissions */}
            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-poppins">Recent Submissions</h2>
                <button 
                  onClick={() => navigate('/admin/curation')}
                  className="text-sm text-secondary-500 hover:text-secondary-600 flex items-center gap-1"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/curation')}
                  >
                    <img
                      src={`https://images.unsplash.com/photo-${1611162617474 + index}-5b21e879e113?auto=format&fit=crop&q=80`}
                      alt="Submission"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-surface-900">New AI Solution #{index + 1}</h3>
                      <p className="text-sm text-surface-600">Submitted 2 hours ago</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded-full flex items-center gap-1">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-poppins">Recent Activity</h2>
                <button className="text-sm text-secondary-500 hover:text-secondary-600 flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { action: 'New user registered', time: '10 minutes ago' },
                  { action: 'Solution approved', time: '1 hour ago' },
                  { action: 'New sale completed', time: '2 hours ago' }
                ].map((activity, index) => (
                  <div key={index} className="p-4 bg-surface-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-surface-900">{activity.action}</p>
                      <span className="text-sm text-surface-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md relative border border-surface-200 shadow-xl">
            <button
              onClick={() => setShowAnnouncementModal(false)}
              className="absolute right-4 top-4 text-surface-400 hover:text-surface-600"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Create Announcement</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                  placeholder="Enter announcement title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 h-32"
                  placeholder="Enter announcement message..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg py-3 px-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAnnouncement}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={!announcementTitle.trim() || !announcementMessage.trim()}
                >
                  Create Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}