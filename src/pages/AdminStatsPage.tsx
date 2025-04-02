import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Package, Calendar,
  ArrowUp, ArrowDown, Download, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { QuantumBackground } from '../components/QuantumBackground';
import { AdminNav } from '../components/AdminNav';
import type { AuthState } from '../types';
import { useAuth } from "../context/AuthContext";

export function AdminStatsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Sample data for charts and statistics
  const revenueData = {
    week: [1200, 1500, 1300, 1800, 2000, 1700, 1900],
    month: [12000, 15000, 13000, 18000, 20000, 17000, 19000, 21000, 18500, 22000, 23000, 25000, 
            24000, 26000, 25500, 27000, 28000, 26500, 29000, 30000, 28500, 31000, 32000, 30500,
            33000, 34000, 32500, 35000, 36000, 34500],
    quarter: [45000, 52000, 58000, 63000],
    year: [150000, 180000, 210000, 240000, 270000, 300000, 330000, 360000, 390000, 420000, 450000, 480000]
  };

  const userSignupsData = {
    week: [15, 20, 18, 25, 30, 28, 35],
    month: [120, 150, 140, 160, 180, 170, 190, 200, 190, 210, 220, 230, 
            220, 240, 230, 250, 260, 250, 270, 280, 270, 290, 300, 290,
            310, 320, 310, 330, 340, 330],
    quarter: [450, 520, 580, 630],
    year: [1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600, 3900, 4200, 4500, 4800]
  };

  const workflowSubmissionsData = {
    week: [5, 8, 6, 10, 12, 9, 15],
    month: [40, 50, 45, 55, 60, 55, 65, 70, 65, 75, 80, 75, 
            85, 90, 85, 95, 100, 95, 105, 110, 105, 115, 120, 115,
            125, 130, 125, 135, 140, 135],
    quarter: [150, 180, 210, 240],
    year: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600]
  };

  const topSellingWorkflows = [
    { name: 'Email Marketing Automation', sales: 245, revenue: 73255, growth: 12 },
    { name: 'Social Media Content Generator', sales: 198, revenue: 39402, growth: 8 },
    { name: 'Customer Support Chatbot', sales: 156, revenue: 77844, growth: 15 },
    { name: 'SEO Content Optimizer', sales: 132, revenue: 46068, growth: 5 },
    { name: 'Data Visualization Tool', sales: 118, revenue: 47082, growth: -3 }
  ];

  const topCreators = [
    { name: 'marketing_guru', workflows: 12, sales: 456, revenue: 98765 },
    { name: 'ai_master', workflows: 8, sales: 345, revenue: 76543 },
    { name: 'data_viz', workflows: 6, sales: 234, revenue: 65432 },
    { name: 'content_pro', workflows: 5, sales: 210, revenue: 54321 },
    { name: 'automation_expert', workflows: 4, sales: 189, revenue: 43210 }
  ];

  // Helper function to get the appropriate data based on the selected time range
  const getDataForTimeRange = (dataSet: any) => {
    return dataSet[timeRange];
  };

  // Helper function to calculate the percentage change
  const calculateChange = (data: number[]) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    return ((current - previous) / previous) * 100;
  };

  // Summary stats
  const summaryStats = [
    { 
      label: 'Total Revenue', 
      value: `$${(revenueData[timeRange].reduce((a, b) => a + b, 0) / 1000).toFixed(1)}k`, 
      change: calculateChange(revenueData[timeRange]).toFixed(1),
      icon: DollarSign,
      color: 'from-green-500 to-green-700'
    },
    { 
      label: 'User Signups', 
      value: userSignupsData[timeRange].reduce((a, b) => a + b, 0), 
      change: calculateChange(userSignupsData[timeRange]).toFixed(1),
      icon: Users,
      color: 'from-blue-500 to-blue-700'
    },
    { 
      label: 'Solution Submissions', 
      value: workflowSubmissionsData[timeRange].reduce((a, b) => a + b, 0), 
      change: calculateChange(workflowSubmissionsData[timeRange]).toFixed(1),
      icon: Package,
      color: 'from-purple-500 to-purple-700'
    },
    { 
      label: 'Conversion Rate', 
      value: '4.8%', 
      change: '0.3',
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-700'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <QuantumBackground intensity="low" className="absolute inset-0 pointer-events-none" overlay={true} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-poppins text-surface-900">Statistics & Analytics</h1>
              <p className="text-surface-600">Comprehensive platform performance metrics</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
                <Download className="h-4 w-4" /> Export Report
              </button>
            </div>
          </div>

          {/* Admin Navigation */}
          <AdminNav />

          {/* Time Range Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-surface-600">Time Range:</span>
              <div className="flex bg-white rounded-lg p-1 border border-surface-200 shadow-sm">
                {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                      timeRange === range 
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-sm' 
                        : 'text-surface-600 hover:text-surface-900'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-surface-50 border border-surface-200 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-surface-200 shadow-card">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500">
                  <option value="all">All Categories</option>
                  <option value="automation">Automation</option>
                  <option value="integration">Integration</option>
                  <option value="workflow">Workflow</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <select className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500">
                  <option value="all">All Prices</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500+">$500+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Creator</label>
                <select className="w-full bg-surface-50 border border-surface-200 rounded-lg py-2 px-4 focus:outline-none focus:border-secondary-500">
                  <option value="all">All Creators</option>
                  <option value="marketing_guru">marketing_guru</option>
                  <option value="ai_master">ai_master</option>
                  <option value="data_viz">data_viz</option>
                </select>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-surface-200 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-sm ${
                    Number(stat.change) >= 0 ? 'text-green-500' : 'text-red-500'
                  } flex items-center gap-1`}>
                    {Number(stat.change) >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(Number(stat.change))}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-surface-900">{stat.value}</h3>
                <p className="text-surface-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-poppins">Revenue</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-surface-600">vs previous period:</span>
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" /> 12.5%
                  </span>
                </div>
              </div>
              
              {/* Placeholder for chart - in a real app, you'd use a charting library */}
              <div className="h-64 bg-surface-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-surface-400" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-poppins">User Growth</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-surface-600">vs previous period:</span>
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" /> 8.3%
                  </span>
                </div>
              </div>
              
              {/* Placeholder for chart */}
              <div className="h-64 bg-surface-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-surface-400" />
              </div>
            </div>
          </div>

          {/* Top Selling Workflows */}
          <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-poppins">Top Selling Solutions</h2>
              <button className="text-sm text-secondary-500 hover:text-secondary-600">
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4">Solution</th>
                    <th className="text-right py-3 px-4">Sales</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingWorkflows.map((workflow, index) => (
                    <tr key={index} className="border-b border-surface-200 hover:bg-surface-50">
                      <td className="py-3 px-4">{workflow.name}</td>
                      <td className="text-right py-3 px-4">{workflow.sales}</td>
                      <td className="text-right py-3 px-4">${workflow.revenue.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`flex items-center justify-end gap-1 ${
                          workflow.growth >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {workflow.growth >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(workflow.growth)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Creators */}
          <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-poppins">Top Creators</h2>
              <button className="text-sm text-secondary-500 hover:text-secondary-600">
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4">Creator</th>
                    <th className="text-right py-3 px-4">Solutions</th>
                    <th className="text-right py-3 px-4">Sales</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topCreators.map((creator, index) => (
                    <tr key={index} className="border-b border-surface-200 hover:bg-surface-50">
                      <td className="py-3 px-4">{creator.name}</td>
                      <td className="text-right py-3 px-4">{creator.workflows}</td>
                      <td className="text-right py-3 px-4">{creator.sales}</td>
                      <td className="text-right py-3 px-4">${creator.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}