import { BarChart3, Package, DollarSign, Star, Users, TrendingUp, Zap, ShoppingBag } from 'lucide-react';
import type { Product, User } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  user: User;
  products: Product[];
}

export function DashboardPage({ products }: DashboardPageProps) {
  const {user, loading} = useAuth()

  if (loading) {
    return <div className='bg-white z-10 h-full'>
         <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading...
    </div>
  }

  if (!user) {
    return (
    <div className='bg-white z-10 h-full'>
    return Please log in
    </div>
    )
  }

  
  console.log("user", user);
  const userProducts = products.filter(product => product.creator === user.name);
  const hasApprovedProducts = userProducts.length > 0;

  // If user has no approved products, show buyer dashboard
  if (!hasApprovedProducts) {
    return (
      <div className="min-h-screen pt-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <ShoppingBag className="h-16 w-16 text-surface-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold font-poppins mb-4">Welcome to Your Buyer Dashboard</h1>
              <p className="text-surface-600 mb-8">
                Track your purchases and manage your AI workflow integrations
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                  <h3 className="font-medium mb-2">Purchased Solutions</h3>
                  <p className="text-3xl font-bold text-secondary-500">0</p>
                  <p className="text-sm text-surface-600 mt-1">Active workflows</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                  <h3 className="font-medium mb-2">Total Spent</h3>
                  <p className="text-3xl font-bold text-secondary-500">$0</p>
                  <p className="text-sm text-surface-600 mt-1">Lifetime purchases</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
                  <h3 className="font-medium mb-2">Active Subscriptions</h3>
                  <p className="text-3xl font-bold text-secondary-500">0</p>
                  <p className="text-sm text-surface-600 mt-1">Monthly recurring</p>
                </div>
              </div>
              
              <div className="mt-12 bg-white rounded-xl p-8 border border-surface-200 shadow-card max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Want to Become a Seller?</h2>
                <p className="text-surface-600 mb-6">
                  Submit your own AI workflows and start earning by helping others automate their work.
                </p>
                <a 
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Zap className="h-5 w-5" />
                  Submit Your First Workflow
                </a>
              </div>
            </div>
          </div>
        </div>
    );
  }

  // Seller dashboard stats
  const totalSales = userProducts.length * 3; // Mock data: assuming 3 sales per product
  const totalRevenue = userProducts.reduce((sum, product) => sum + (product.price * 3), 0);
  const averageRating = 4.5; // Mock data

  const stats = [
    { label: 'Total Products', value: userProducts.length, icon: Package, color: 'from-blue-500 to-blue-700' },
    { label: 'Total Sales', value: totalSales, icon: TrendingUp, color: 'from-purple-500 to-purple-700' },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-green-700' },
    { label: 'Average Rating', value: averageRating.toFixed(1), icon: Star, color: 'from-yellow-500 to-yellow-700' },
    { label: 'Active Users', value: totalSales * 2, icon: Users, color: 'from-pink-500 to-pink-700' }
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
                {userProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img src={product.image} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-surface-600">3 sales</p>
                      </div>
                    </div>
                    <p className="font-bold">${(product.price * 3).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 p-6 shadow-card">
              <h2 className="text-xl font-bold mb-4 font-poppins">Recent Reviews</h2>
              <div className="space-y-4">
                {userProducts.map(product => (
                  <div key={product.id} className="p-4 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{product.title}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-surface-300'}`}
                            fill={i < 4 ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-surface-600">
                      "Great automation tool! Saved me hours of work." - John Doe
                    </p>
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