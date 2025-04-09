import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, DollarSign, User, FileArchive, CheckCircle, Download, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Define types for our data
interface Solution {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  solution_id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method?: string;
  solution?: Solution;
}

export function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch order details
        const { data, error } = await supabase
          .from('orders')
          .select()
          .eq('id', orderId)
          .single();
        
        if (error) throw error;
        
        // Verify that the order belongs to the current user
        if (data.user_id !== user.id) {
          setError('You do not have permission to view this order');
          return;
        }
        console.log("data", data);
        
        setOrder(data as Order);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-secondary-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-surface-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-20 bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-surface-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-surface-600 mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Determine order status
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', icon: CheckCircle, color: 'text-green-500' };
      case 'pending':
        return { text: 'Pending', icon: Clock, color: 'text-yellow-500' };
      case 'cancelled':
        return { text: 'Cancelled', icon: AlertCircle, color: 'text-red-500' };
      default:
        return { text: 'Unknown', icon: AlertCircle, color: 'text-surface-400' };
    }
  };

  const downloadBlueprint = async () => {
    if (!order?.solution?.bluePrint) {
      alert('No blueprint available for download');
      return;
    }
    try {
      const url = order.solution.bluePrint;
      const filename = url.split('/').pop() || 'blueprint';
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download blueprint');
    }
  };

  const statusInfo = getStatusInfo(order.status);
  return (
    <div className="min-h-screen py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-secondary-500 hover:text-secondary-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-card mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order Details</h1>
              <p className="text-surface-600">Order ID: {order.id}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <span className={`flex items-center ${statusInfo.color} font-medium`}>
                <statusInfo.icon className="h-5 w-5 mr-2" />
                {statusInfo.text}
              </span>
            </div>
          </div>
            {/* {order?.solution?.bluePrint && (
              console.log("order?.bluePrint", order?.solution?.bluePrint),
              <div className="bg-blue-50/50 border border-blue-100 p-4 mb-8 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm text-blue-800 flex items-center gap-2">
                    <FileArchive className="h-5 w-5" />
                    Workflow Blueprint
                  </h4>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                    Download Available
                  </span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileArchive className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-surface-700 mb-1">
                      {order?.solution?.bluePrint .split("/").pop() || "blueprint.pdf"}
                    </p>
                    <p className="text-xs text-surface-500">
                      Click to download the complete blueprint
                    </p>
                  </div>
                  <a
                    href={order?.solution?.bluePrint} download className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    aria-label="Download blueprint"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              </div>
              )} */}
              {order?.solution?.bluePrint && (
  <div className="bg-blue-50/50 border border-blue-100 p-4 mb-8 rounded-xl">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-sm text-blue-800 flex items-center gap-2">
        <FileArchive className="h-5 w-5" />
        Workflow Blueprint
      </h4>
      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
        Download Available
      </span>
    </div>

    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
      <div className="bg-blue-100 p-3 rounded-lg">
        <FileArchive className="h-8 w-8 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-surface-700 mb-1">
          {order.solution.bluePrint.split('/').pop() || 'blueprint'}
        </p>
        <p className="text-xs text-surface-500">
          Click to download the complete blueprint
        </p>
      </div>
      <button
        onClick={downloadBlueprint}
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        aria-label="Download blueprint"
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  </div>
)}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface-50 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2 text-surface-400" />
                Product Information
              </h3>
              <div className="flex items-start space-x-4">
                {order.solution?.image ? (
                  <img 
                    src={order.solution.image} 
                    alt={order.solution.title} 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-surface-200 flex items-center justify-center">
                    <Package className="h-8 w-8 text-surface-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{order.solution?.title || 'Unknown Product'}</p>
                  <p className="text-sm text-surface-600 mt-1">
                    {order.solution?.description || 'No description available'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-50 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-surface-400" />
                Order Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-surface-600">Order Date:</span> {orderDate}
                </p>
                <p className="text-sm">
                  <span className="text-surface-600">Amount:</span> ${Number(order.amount).toLocaleString()}
                </p>
                {order.payment_method && (
                  <p className="text-sm">
                    <span className="text-surface-600">Payment Method:</span> {order.payment_method}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-surface-200 pt-6">
            <h3 className="font-medium mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-surface-600">Subtotal</span>
                <span>${Number(order.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold border-t border-surface-200 pt-2">
                <span>Total</span>
                <span>${Number(order.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-card">
          <h2 className="text-xl font-bold mb-4">Need Help?</h2>
          <p className="text-surface-600 mb-4">
            If you have any questions about your order, please contact our support team.
          </p>
          <button className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
} 