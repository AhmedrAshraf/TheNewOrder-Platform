import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Notification } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // Fetch announcements
        const { data: announcements, error: announcementsError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (announcementsError) throw announcementsError;

        // Convert announcements to notifications
        const announcementNotifications: Notification[] = announcements.map(announcement => {
          // Check if the current user has read this announcement
          const readBy = announcement.read_by || [];
          const isRead = Array.isArray(readBy) && readBy.includes(user.id);
          
          return {
            id: announcement.id,
            type: 'system',
            title: announcement.title,
            message: announcement.message,
            read: isRead,
            createdAt: announcement.created_at,
            // link: '/blog/announcements'
          };
        });

        setNotifications(announcementNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Subscribe to real-time changes
    const announcementsSubscription = supabase
      .channel('announcements')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New announcement
            const newAnnouncement = payload.new;
            const newNotification: Notification = {
              id: newAnnouncement.id,
              type: 'system',
              title: newAnnouncement.title,
              message: newAnnouncement.message,
              read: false,
              createdAt: newAnnouncement.created_at,
              // link: '/blog/announcements'
            };
            setNotifications(prev => [newNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Updated announcement (e.g., read_by changes)
            const updatedAnnouncement = payload.new;
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === updatedAnnouncement.id
                  ? {
                      ...notification,
                      read: Array.isArray(updatedAnnouncement.read_by) && 
                            updatedAnnouncement.read_by.includes(user?.id)
                    }
                  : notification
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Deleted announcement
            const deletedAnnouncement = payload.old;
            setNotifications(prev => 
              prev.filter(notification => notification.id !== deletedAnnouncement.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      announcementsSubscription.unsubscribe();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      const { data: announcement, error: fetchError } = await supabase
        .from('announcements')
        .select('read_by')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const readBy = announcement?.read_by || [];
      if (!Array.isArray(readBy)) {
        throw new Error('read_by is not an array');
      }

      if (!readBy.includes(user.id)) {
        readBy.push(user.id);

        const { error: updateError } = await supabase
          .from('announcements')
          .update({ read_by: readBy })
          .eq('id', id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      // Get all unread announcement IDs
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      // Update each announcement's read_by array
      for (const id of unreadIds) {
        const { data: announcement, error: fetchError } = await supabase
          .from('announcements')
          .select('read_by')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Update the read_by array
        const readBy = announcement?.read_by || [];
        if (!Array.isArray(readBy)) {
          throw new Error('read_by is not an array');
        }

        // Only add the user ID if it's not already in the array
        if (!readBy.includes(user.id)) {
          readBy.push(user.id);
          
          // Save updated read_by to Supabase
          const { error: updateError } = await supabase
            .from('announcements')
            .update({ read_by: readBy })
            .eq('id', id);

          if (updateError) throw updateError;
        }
      }
    } catch (error) {
      console.error('Error marking all announcements as read:', error);
    }
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