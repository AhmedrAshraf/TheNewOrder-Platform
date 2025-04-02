import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, CreditCard } from 'lucide-react';
import { QuantumBackground } from '../components/QuantumBackground';
import type { User as UserType } from '../types';
import { useAuth } from "../context/AuthContext";

// sample purchase history data
const SAMPLE_PURCHASES = [
  {
    id: 'pur_1',
    productName: 'AI Document Processor',
    date: '2025-06-15',
    amount: 299,
    status: 'completed'
  },
  {
    id: 'pur_2',
    productName: 'Social Media Content Generator',
    date: '2025-06-10',
    amount: 199,
    status: 'completed'
  },
  {
    id: 'pur_3',
    productName: 'Email Marketing AI',
    date: '2025-06-01',
    amount: 399,
    status: 'completed'
  }
];

export function SettingsPage() {
  const navigate = useNavigate();
    const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false
  });

  // Redirect if not logged in
  if (!user) {
    navigate('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the settings to a backend
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'purchases', label: 'Purchases', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl font-bold mb-8 font-poppins">Account Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-24">
          <div className="w-full md:w-64">
            <div className="bg-white rounded-xl overflow-hidden border border-surface-200 shadow-card">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' 
                      : 'hover:bg-surface-50 text-surface-600'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold mb-4 font-poppins">Profile Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20 h-32"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg py-2 px-6 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Save Changes
                  </button>
                </form>
              )}
              
              {activeTab === 'security' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/20"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      name="twoFactorAuth"
                      checked={formData.twoFactorAuth}
                      onChange={handleChange}
                      className="h-4 w-4 text-secondary-500 focus:ring-secondary-500 border-surface-200 rounded"
                    />
                    <label htmlFor="twoFactorAuth" className="ml-2 block text-sm">
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg py-2 px-6 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Save Changes
                  </button>
                </form>
              )}
              
              {activeTab === 'notifications' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-surface-600">Receive notifications about your account activity</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Marketing Emails</h3>
                        <p className="text-sm text-surface-600">Receive updates about new features and promotions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="marketingEmails"
                          checked={formData.marketingEmails}
                          onChange={handleChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-500"></div>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg py-2 px-6 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Save Changes
                  </button>
                </form>
              )}
              
              {activeTab === 'purchases' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Purchase History</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-surface-200">
                          <th className="text-left py-3 px-4">Product</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-right py-3 px-4">Amount</th>
                          <th className="text-right py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_PURCHASES.map((purchase) => (
                          <tr key={purchase.id} className="border-b border-surface-200">
                            <td className="py-3 px-4">{purchase.productName}</td>
                            <td className="py-3 px-4">{purchase.date}</td>
                            <td className="py-3 px-4 text-right">${purchase.amount}</td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {purchase.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {SAMPLE_PURCHASES.length === 0 ? (
                    <div className="text-center py-8 bg-surface-50 rounded-lg">
                      <p className="text-surface-600">No purchases yet</p>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm text-surface-600">
                      <p>Showing {SAMPLE_PURCHASES.length} purchases</p>
                      <button className="text-secondary-500 hover:text-secondary-600">
                        Download History
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with quantum animation */}
      <div className="h-24 relative">
        <QuantumBackground intensity="low" className="absolute inset-0" overlay={false} />
      </div>
    </div>
  );
}