import { BarChart3, Package, DollarSign, Star, Users, TrendingUp, Zap, LayoutDashboard,  ShoppingBag, Shield } from 'lucide-react';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  // All hooks must be called unconditionally at the top level
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [userList, setUserList] = useState([])
  const [solution, setSolution] = useState([])
  const [reviews, setReviews] = useState([]); 
  const [loadingReviews ,setLoadingReviews] = useState(false)
  const [totalSpent, setTotalSpent] = useState(null)
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState(null)
  const [showSellerDashboard, setShowSellerDashboard] = useState(0);

  useEffect(() => {
    console.log(user?.id);
    
    if (!user?.id) return;
  
    const fetchDashboardData = async () => {
      try {
        setLoadingProducts(true);
        setLoadingReviews(true);

        // fetch solution 
        const { data: fetchSoltuion, error: fetchSoltuionError } = await supabase
        .from('solutions')
        .select('')
        .eq('user_id', user.id);
        console.log("fetch Soltuion", fetchSoltuion);
        
        if (fetchSoltuionError) throw fetchSoltuionError;
        setSolution(fetchSoltuion || []);
        console.log("Soltuion", fetchSoltuion);
        

        // First most buying items
        const { data: productsData, error: productsError } = await supabase
          .from('orders')
          .select('*')
          // .eq('user_id', user.id)
          .limit(8);
  
        if (productsError) throw productsError;
        setProducts(productsData || []);
        
        // Then fetch reviews only if we have products
        if (fetchSoltuion && fetchSoltuion.length > 0) {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select()
            .in('solution_id', fetchSoltuion.map(p => p.id));
  
          if (reviewsError) throw reviewsError;
          setReviews(reviewsData || []);
        }
  
        // Fetch user count
        const { count: userCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
  
        if (usersError) throw usersError;
        setUserList(userCount || 0);
  
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoadingProducts(false);
        setLoadingReviews(false);
      }
    };
  
    fetchDashboardData();
  }, [user?.id]);


  useEffect(() => {
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      setAverageRating(avgRating); 
    } else {
      setAverageRating(0); 
    }
  }, [reviews]);


  const totalSpentValue = products?.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  useEffect(() => {
    setTotalSpent(totalSpentValue);
  }, [totalSpentValue]);  

  // Handle loading states
  if (loading || loadingProducts || loadingReviews) {
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
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Shield className="h-12 w-12 text-surface-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-surface-600 mb-6">
            Please sign in to access your dashboard
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Filter products - ensure this matches your data structure
  const userProducts = products.filter(product => product?.user_id === user.id || product?.creator?.creator_id === user.id);
  const purchaseOrders = products.filter(product => product?.user_id === user.id || product?.creator?.creator_id === user.id);
  const myRecentsSale = products.filter(product => product?.sellerId === user.id );
  const saleCount = products.filter(product => {
    return product?.solution_id && solution.some(sol => sol.id === product.solution_id);
  });

  console.log("products", products);
  console.log("🚀🚀 saleCount:", saleCount);
  

  console.log("products", products);
  console.log("🚀🚀 saleCount:", saleCount)

  // If user has no approved products, show buyer dashboard
  let hasApprovedProducts = userProducts.length > 0;
  if (hasApprovedProducts && !showSellerDashboard) {
    return (
      <div className="min-h-screen pt-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <ShoppingBag className="h-16 w-16 text-surface-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold font-poppins mb-4">Welcome to Your Buyer Dashboard</h1>
              <p className="text-surface-600 mb-8">
                Track your purchases and manage your AI workflow integrations
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                  <h3 className="font-medium mb-2">Purchased Solutions</h3>
                  <p className="text-3xl font-bold text-secondary-500">{purchaseOrders.length}</p>
                  <p className="text-sm text-surface-600 mt-1">Active workflows</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                  <h3 className="font-medium mb-2">Total Spent</h3>
                  <p className="text-3xl font-bold text-secondary-500">${Number(totalSpent).toLocaleString()}</p>
                  <p className="text-sm text-surface-600 mt-1">Lifetime purchases</p>
                </div>
              </div>
              
              <div className="mt-12 bg-white rounded-xl p-8 border border-surface-200 shadow-card max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Want to Become a Seller?</h2>
                <p className="text-surface-600 mb-6">
                  Submit your own AI workflows and start earning by helping others automate their work.
                </p>
                <a 
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl mx-2"
                  >
                  <Zap className="h-5 w-5" />
                  Submit Your Workflow
                </a>
                {solution?.length >= 1 && (
                <a 
                onClick={() => setShowSellerDashboard(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl mx-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Go to seller dashboard
                </a>
                )}
              </div>
            </div>
          </div>
        </div>
    );
  }

  // Seller dashboard stats
  const totalSales = userProducts.length; 
  const totalRevenue = userProducts.reduce((sum, product) => sum + Number(product.amount || 0), 0);

  const stats = [
    { label: 'Total Products', value: solution.length, icon: Package, color: 'from-blue-500 to-blue-700' },
    { label: 'Total Sales', value: saleCount.length, icon: TrendingUp, color: 'from-purple-500 to-purple-700' },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-green-700' },
    { label: 'Average Rating', value: averageRating.toFixed(1), icon: Star, color: 'from-yellow-500 to-yellow-700' }, 
    { label: 'Active Users', value: userList,  icon: Users, color: 'from-pink-500 to-pink-700' }
  ];

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins">Welcome back, {user.name}!</h1>
              <p className="text-surface-600">Here's what's happening with your AI solutions</p>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-surface-200 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <BarChart3 className="h-4 w-4 text-surface-400" />
                </div>
                <p className="text-surface-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-card">
              <h2 className="text-xl font-bold mb-4 font-poppins">Recent Sales</h2>
              <div className="space-y-4">
                {myRecentsSale ? (
                myRecentsSale?.map(product => (
                  <div key={product?.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src={product?.solution?.image || product?.solution?.files} alt={product?.solution?.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{product?.solution?.title}</p>
                        <p className="text-sm text-surface-600">{saleCount.length} sales</p>
                        <p className="text-sm mt-2 text-surface-600">{new Date(product.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="font-bold">${product?.amount.toLocaleString()}</p>
                  </div>
                ))
              ):(
                <div>
                  <p className="text-surface-500 text-center py-4">No recents sales found</p>
                </div>
              )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-card">
              <h2 className="text-xl font-bold mb-4 font-poppins">Recent Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-surface-500 text-center py-4">No reviews yet</p>
              ) : loadingReviews ? (
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
                    <p>Loading dashboard...</p>
                  </div>
                </div>
               ):(
                <div className="space-y-4">
                {reviews.slice(0, 5).map(review => {
                  const matchedSolution = solution.find(sol => sol.id === review.solution_id);

                  return (
                    <div key={review.id} className="p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="">{matchedSolution?.title || 'Unknown Product'}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`h-4 w-4 ${i < review?.rating ? 'text-yellow-400' : 'text-surface-300'}`}
                              fill={i < review?.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="font-medium mb-1">
                        {review.comment || "No comment provided"}
                      </p>
                      <p className="text-surface-500">
                        - {review.user_name || review.user?.email?.split('@')[0] || 'Anonymous'}
                      </p>
                    </div>
                  );
                })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-card">
              <h2 className="text-xl font-bold mb-4 font-poppins">Recent Solutions</h2>
              <div className="space-y-4">
                {solution.map(product => (
                  <div key={product?.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src={product?.image} alt={product?.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{product?.title}</p>
                        <p className="text-sm text-surface-600">{myRecentsSale.length} sales</p>
                      </div>
                    </div>
                    <p className="font-bold">${product?.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}