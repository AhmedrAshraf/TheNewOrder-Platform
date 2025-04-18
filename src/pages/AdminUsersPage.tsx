import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, ChevronUp, UserPlus, Shield, Download, XCircle } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';
import type { AuthState } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  full_name: string;
  workflows: number;
  purchases: number;
  revenue: number;
}

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('users')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: allSolutions, error: solutionsError } = await supabase
        .from('solutions')
        .select('user_id');

      if (solutionsError) throw solutionsError;

      const solutionsCount: Record<string, number> = {};
      allSolutions?.forEach(solution => {
        const userId = solution.user_id;
        solutionsCount[userId] = (solutionsCount[userId] || 0) + 1;
      });

      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, amount');

      if (ordersError) throw ordersError;

      const ordersData: Record<string, { count: number, total: number }> = {};
      allOrders?.forEach(order => {
        const userId = order.user_id;
        if (!ordersData[userId]) {
          ordersData[userId] = { count: 0, total: 0 };
        }
        ordersData[userId].count += 1;
        // Convert amount to number and add it to the total
        const amount = typeof order.amount === 'string' ? parseFloat(order.amount) : (order.amount || 0);
        ordersData[userId].total += amount;
      });

      // Combine the data
      const combinedUsers = profiles.map(profile => {
        const userId = profile.id;
        const userSolutions = solutionsCount[userId] || 0;
        const userOrders = ordersData[userId] || { count: 0, total: 0 };

        return {
          id: profile.id,
          email: profile.email,
          role: profile.role || 'user',
          status: profile.status || 'active',
          created_at: profile.created_at,
          full_name: profile.name && profile.last_name ? `${profile.name} ${profile.last_name}` : 'Unknown User',
          workflows: userSolutions,
          purchases: userOrders.count,
          revenue: userOrders.total
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };


  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-surface-200 shadow-card max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name-asc':
        return a.full_name.localeCompare(b.full_name);
      case 'name-desc':
        return b.full_name.localeCompare(a.full_name);
      case 'revenue-high':
        return b.revenue - a.revenue;
      case 'revenue-low':
        return a.revenue - b.revenue;
      default:
        return 0;
    }
  });

  const handleUserAction = (action: string, userId: string) => {
    switch (action) {
      case 'view':
        const user = users.find(u => u.id === userId);
        if (user) {
          setSelectedUser(user);
          setShowUserModal(true);
        }
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this user?')) {
          setUsers(users.filter(u => u.id !== userId));
        }
        break;
      case 'suspend':
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: 'suspended' } : u
        ));
        break;
      case 'activate':
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: 'active' } : u
        ));
        break;
      case 'promote':
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: 'admin' } : u
        ));
        break;
      case 'demote':
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: 'user' } : u
        ));
        break;
    }
    setShowActionMenu(null);
  };


  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded-full">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-surface-200 text-surface-600 text-xs rounded-full">Inactive</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-500/20 text-red-600 text-xs rounded-full">Suspended</span>;
      default:
        return <span className="px-2 py-1 bg-surface-200 text-surface-600 text-xs rounded-full">{status}</span>;
    }
  };

  const toggleActionMenu = (userId: string) => {
    setShowActionMenu(showActionMenu === userId ? null : userId);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-surface-900">User Management</h1>
              <p className="text-surface-600">Manage platform users and their permissions</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Add User
              </button>
            </div>
          </div>

          {/* Admin Navigation */}
          <AdminNav />

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-secondary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-surface-400" />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-50 border border-surface-200 rounded-lg px-3 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="revenue-high">Revenue (High-Low)</option>
                <option value="revenue-low">Revenue (Low-High)</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-surface-50 border border-surface-200 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              <button className="px-3 py-2 bg-surface-50 border border-surface-200 hover:bg-surface-100 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-surface-200 shadow-card">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-surface-200 shadow-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500 mx-auto"></div>
              <p className="mt-4 text-surface-500">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Workflows</th>
                    <th className="text-right py-3 px-4">Purchases</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Joined</th>
                    {/* <th className="text-right py-3 px-4">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.id} className="border-t border-surface-200 hover:bg-surface-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary-500 rounded-full w-8 h-8 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user?.full_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-surface-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.role === 'admin' ? (
                          <span className="flex items-center gap-1 text-secondary-500">
                            <Shield className="h-3 w-3" /> Admin
                          </span>
                        ) : (
                          <span>User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getUserStatusBadge(user.status)}
                      </td>
                      <td className="text-right py-3 px-4">{user.workflows}</td>
                      <td className="text-right py-3 px-4">{user.purchases}</td>
                      <td className="text-right py-3 px-4">${user.revenue}</td>
                      <td className="text-right py-3 px-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      {/* <td className="text-right py-3 px-4 relative">
                        <button
                          onClick={() => toggleActionMenu(user.id)}
                          className="p-1 hover:bg-surface-100 rounded-full"
                        >
                          <MoreHorizontal className="h-5 w-5 text-surface-400" />
                        </button>
                        
                        {showActionMenu === user.id && (
                          <div className="absolute right-4 mt-1 w-48 bg-white border border-surface-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleUserAction('view', user.id)}
                              className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2 rounded-t-lg"
                            >
                              <Eye className="h-4 w-4 text-surface-400" /> View Details
                            </button>
                            <button
                              onClick={() => handleUserAction('edit', user.id)}
                              className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4 text-surface-400" /> Edit User
                            </button>
                            <button
                              onClick={() => handleUserAction('email', user.id)}
                              className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2"
                            >
                              <Mail className="h-4 w-4 text-surface-400" /> Send Email
                            </button>
                            
                            <div className="border-t border-surface-200 my-1"></div>
                            
                            {user.role === 'user' ? (
                              <button
                                onClick={() => handleUserAction('promote', user.id)}
                                className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2"
                              >
                                <Shield className="h-4 w-4 text-secondary-500" /> Make Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction('demote', user.id)}
                                className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2"
                              >
                                <Shield className="h-4 w-4 text-surface-400" /> Remove Admin
                              </button>
                            )}
                            
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleUserAction('suspend', user.id)}
                                className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2"
                              >
                                <Ban className="h-4 w-4 text-red-500" /> Suspend User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction('activate', user.id)}
                                className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2"
                              >
                                <Ban className="h-4 w-4 text-green-500" /> Activate User
                              </button>
                            )}
                            
                            <div className="border-t border-surface-200 my-1"></div>
                            
                            <button
                              onClick={() => handleUserAction('delete', user.id)}
                              className="w-full text-left px-4 py-2 hover:bg-surface-50 flex items-center gap-2 text-red-500 rounded-b-lg"
                            >
                              <Trash className="h-4 w-4" /> Delete User
                            </button>
                          </div>
                        )}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            
            {!loading && sortedUsers.length === 0 && (
              <div className="p-8 text-center text-surface-500">
                No users found matching your filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-surface-500">
              Showing {sortedUsers.length} of {users.length} users
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-secondary-500 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors">
                2
              </button>
              <button className="px-3 py-1 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors">
                3
              </button>
              <button className="px-3 py-1 bg-surface-50 hover:bg-surface-100 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}