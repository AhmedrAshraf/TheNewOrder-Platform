import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Notification } from '../types';

// Sample notifications for demonstration
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'admin',
    title: 'New Workflow Submission',
    message: 'A new AI workflow has been submitted for review',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    link: '/admin/curation'
  },
  {
    id: '2',
    type: 'creator',
    title: 'Workflow Approved',
    message: 'Your "Email Marketing Automation" workflow has been approved',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    link: '/dashboard'
  },
  {
    id: '3',
    type: 'buyer',
    title: 'New Purchase',
    message: 'You have successfully purchased "AI Document Processor"',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    link: '/dashboard'
  },
  {
    id: '4',
    type: 'admin',
    title: 'New User Registration',
    message: 'A new user has registered on the platform',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    link: '/admin/users'
  },
  {
    id: '5',
    type: 'creator',
    title: 'New Sale',
    message: 'Your "Social Media Content Generator" has been purchased',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    link: '/dashboard'
  },
  {
    id: '6',
    type: 'buyer',
    title: 'Workflow Updated',
    message: 'A workflow you purchased has been updated with new features',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    link: '/marketplace'
  }
];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getNotificationsForUser: (user: User | null) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationsForUser = (user: User | null) => {
    if (!user) return [];
    
    // Filter notifications based on user role
    if (user.role === 'admin') {
      return notifications.filter(n => ['admin', 'system'].includes(n.type));
    } else {
      // For regular users, show creator notifications if they have products
      const hasProducts = user.products && user.products.length > 0;
      return notifications.filter(n => 
        n.type === 'buyer' || (hasProducts && n.type === 'creator') || n.type === 'system'
      );
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        getNotificationsForUser
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};