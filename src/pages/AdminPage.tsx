import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, DollarSign, Star, Users, TrendingUp, Shield, 
  Bell, ChevronRight, ArrowUp, ArrowDown, Clock, X, CreditCard
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
  const [solution, setSolution] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [RecentSolution, setRecentSolution] = useState([]);
  const [latestUserTime, setLatestUserTime] = useState(null);
  const [latestApprovalTime, setLatestApprovalTime] = useState(null)
  const [newOrderCompleted, setNewOrderCompleted] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([]);
  const [bankDetails, setBankDetails] = useState(null)
  const [solutionsData, setSolutionsData] = useState([]);
  const [showBankDetailsModal ,setShowBankDetailsModal] = useState(false)
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select();
  
      if (error) {
        console.log("error", error);
        return [];
      } else {
        setUsers(data || []);
      }
    };

    const fetchSolution = async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select();
  
      if (error) {
        console.log("error", error);
        return [];
      } else {
        setSolutionsData(data || []); 
        setSolution(data?.length || 0);
      }
    };

    const fetchPendingReviews = async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select()
        .eq('status', 'pending');
  
      if (error) {
        console.log("error", error);
        return [];
      } else {
        setPendingList(data?.length || 0);
      }
    };

    const RecentSubmissions = async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select()
        .eq('status', 'pending');
  
      if (error) {
        console.log("error", error);
      } else {
        setRecentSolution(data || [])
      }
    };

    const fetchLatestUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("created_at")
        .order("created_at", { ascending: false }) 
        .limit(1); 
      if (error) {
        console.error("Error fetching latest user:", error);
        return;
      }
      if (data?.length > 0) {
        const latestTime = new Date(data[0].created_at);
        setLatestUserTime(formatDistanceToNow(latestTime, { addSuffix: true }));
      }
    };

    const fetchLatestApproval = async () => {
      const { data, error } = await supabase
        .from("solutions") 
        .select("approved_at")
        .order("approved_at", { ascending: true }) 
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching latest approved solution:", error);
        return;
      }

      if (data && data.approved_at) {
        const latestTime = new Date(data.approved_at);
        if (!isNaN(latestTime.getTime())) { 
          setLatestApprovalTime(formatDistanceToNow(latestTime, { addSuffix: true }));
        } else {
          setLatestApprovalTime("Invalid date");
        }
      } else {
        setLatestApprovalTime("No approved solution found");
      }
    };

    const fetchNewOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("created_at")
        .order("created_at", { ascending: false }) 
        .limit(1); 

      if (error) {
        console.error("Error fetching latest order:", error);
        return;
      }
      if (data?.length > 0) {
        const latestTime = new Date(data[0].created_at);
        setNewOrderCompleted(formatDistanceToNow(latestTime, { addSuffix: true }));
      } else {
        setNewOrderCompleted("No sale found")
      }
    };

    const fetchPendingOrders = async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq('PaidFromAdmin', false);

      if (ordersError) {
        console.error("Error fetching pending orders:", ordersError);
        return;
      }

      // Fetch proposal details for orders without solution_id but with message_id
      const ordersWithProposals = await Promise.all(
        ordersData.map(async (order) => {
          if (!order.solution_id && order.message_id) {
            const { data: messageData, error: messageError } = await supabase
              .from("messages")
              .select("proposal")
              .eq('id', order.message_id)
              .single();
            
              console.log("🚀 ~ ordersData.map ~ messageData:", messageData)
              if (!messageError && messageData?.proposal) {
              try {
                return {
                  ...order,
                  proposal: typeof messageData.proposal === 'string' 
                    ? JSON.parse(messageData.proposal) 
                    : messageData.proposal
                };
              } catch (e) {
                console.error("Error parsing proposal:", e);
                return order;
              }
            }
          }
          return order;
        })
      );

      setPendingOrders(ordersWithProposals || []);
    };

    fetchUser();
    fetchSolution();
    fetchPendingReviews();
    RecentSubmissions();
    fetchLatestUser();
    fetchLatestApproval();
    fetchNewOrder();
    fetchPendingOrders();
  }, []);

  const getSolutionDetails = (solution_id) => {
    if (!solution_id) return null;
    return solutionsData.find(solution => solution.id === solution_id);
  };
  
  const handleCreateAnnouncement = () => {
    setShowAnnouncementModal(true);
  };

  const handleSubmitAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    try {
      // Save announcement to Supabase
      const { data: announcement, error } = await supabase
        .from('announcements')
        .insert([
          {
            title: announcementTitle,
            message: announcementMessage,
            created_by: user?.id,
            created_at: new Date().toISOString(),
            read_by: []
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Clear form and close modal
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setShowAnnouncementModal(false);

      // No need to manually add notification here as it will be handled by real-time subscription
    } catch (error) {
      console.error('Error creating announcement:', error);
      // You might want to show an error message to the user here
    }
  };

  const handlePaidFromAdmin = async (orderId: any) => {
    const { error } = await supabase
      .from('orders')
      .update({ PaidFromAdmin: true })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating payment status:", error);
      return;
    }

    setPendingOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

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

  const showDetails =async (order) => {
    console.log("🚀 ~ showDetails ~ order:", order)
    const { data, error } = await supabase
    .from('users')
    .select('seller_bank_details')
    .eq("id", order.user_id)
    .single()
    
    if(error){
      console.error("error", error);
      return
    }
   
    setBankDetails(data?.seller_bank_details)
    setShowBankDetailsModal(true);
    console.log("🚀 ~ showDetails ~ data:", data)
    

  }
  
  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, change: '+12%', color: 'from-blue-500 to-blue-700' },
    { label: 'Total Solutions', value: solution, icon: Package, change: '+8%', color: 'from-purple-500 to-purple-700' },
    { label: 'Revenue', value: '$48,290', icon: DollarSign, change: '+24%', color: 'from-green-500 to-green-700' },
    { label: 'Pending Reviews', value: pendingList, icon: Clock, change: '-3%', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Pending Payments', value: pendingOrders.length, icon: CreditCard, change: '-3%', changeType: 'negative', color: 'from-red-500 to-red-600',link: '/admin/payments'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

              {RecentSolution.map((item, index)=>{
                 const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
                return(
                <div key={index} onClick={() => navigate('/admin/curation')} className="flex items-center gap-4 p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer">
                    <img src={item.image} alt="Submission" className="w-12 h-12 rounded-lg object-cover"/>
                    <div className="flex-1">
                      <h3 className="font-medium text-surface-900">{item?.title}</h3>
                      <p className="text-sm text-surface-600">Submitted {timeAgo}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded-full flex items-center gap-1">
                    {item?.status}  
                    </span>
                </div>
                )
                })}
            </div>

            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-poppins">Recent Activity</h2>
                <button className="text-sm text-secondary-500 hover:text-secondary-600 flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { action: 'New user registered', time: latestUserTime },
                  { action: 'Solution approved', time: latestApprovalTime },
                  { action: 'New sale completed', time: newOrderCompleted }
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

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-poppins">Pending Payments From Admin ({pendingOrders.length})</h2>
                <button 
                  onClick={() => navigate('/admin/orders')}
                  className="text-sm text-secondary-500 hover:text-secondary-600 flex items-center gap-1"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {pendingOrders.map((order, index) => {
                const timeAgo = formatDistanceToNow(new Date(order.created_at), { addSuffix: true });
                const solutionDetails = getSolutionDetails(order?.solution_id);
                const proposal = order?.proposal;
                
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                    <img 
                      src={solutionDetails?.image || proposal?.image || order.image} 
                      alt="Order" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-surface-900">
                        {solutionDetails?.title || proposal?.title || order?.title}
                      </h3>
                      <p className="text-sm text-surface-600">Ordered {timeAgo}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showDetails(order);
                      }}
                      className="bg-gradient-to-r px-4 py-2 rounded-lg from-primary-600 to-secondary-500 text-white"
                    >
                      Show Details
                    </button>
                    <span className="px-2 py-1 bg-secondary-500 border-surface-200 text-white text-md rounded-lg flex items-center gap-1">
                      ${order?.amount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaidFromAdmin(order.id);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Mark as Paid
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

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

      {/* Bank Details Modal */}
{showBankDetailsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Bank Details</h3>
        <button 
          onClick={() => setShowBankDetailsModal(false)}
          className="text-surface-500 hover:text-surface-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {bankDetails ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-surface-500">Account Name</p>
            <p className="font-medium">{bankDetails.accountName}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500">Account Number</p>
            <p className="font-medium">{bankDetails.accountNumber}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500">Bank Name</p>
            <p className="font-medium">{bankDetails.bankName}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500">IFSC Code</p>
            <p className="font-medium">{bankDetails.ifscCode}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500">Primary Account</p>
            <p className="font-medium">{bankDetails.isPrimary ? "Yes" : "No"}</p>
          </div>
        </div>
      ) : (
        <p>No bank details available</p>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setShowBankDetailsModal(false)}
          className="px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}