import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, FileText, Users, TrendingUp, Plus } from 'lucide-react';

interface AdminNavProps {
  className?: string;
}

export function AdminNav({ className = '' }: AdminNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { label: 'Solution Curation', icon: FileText, path: '/admin/curation' },
    { label: 'Add New Solution', icon: Plus, path: '/admin/add-product' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Statistics', icon: TrendingUp, path: '/admin/stats' }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 ${className}`}>
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => navigate(item.path)}
          className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
            location.pathname === item.path 
              ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-lg' 
              : 'bg-white border border-surface-200 hover:border-secondary-500/50 text-surface-900 shadow-card hover:shadow-card-hover'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}