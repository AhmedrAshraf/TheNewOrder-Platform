import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useClickOutside } from '../hooks/useClickOutside';
import type { User, Notification } from '../types';

interface NotificationCenterProps {
  user: User | null;
}

export function NotificationCenter({ user }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    getNotificationsForUser 
  } = useNotifications();
  
  const userNotifications = getNotificationsForUser(user);

  useClickOutside(notificationRef, () => setIsOpen(false));

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'bg-primary-500';
      case 'creator':
        return 'bg-secondary-500';
      case 'buyer':
        return 'bg-green-500';
      case 'system':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-surface-100 rounded-lg relative"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-surface-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-secondary-500 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl border border-surface-200 shadow-xl z-50">
          <div className="p-4 border-b border-surface-200 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="p-1 hover:bg-surface-100 rounded-full"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4 text-surface-400" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-surface-100 rounded-full"
              >
                <X className="h-4 w-4 text-surface-400" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {userNotifications.length === 0 ? (
              <div className="p-4 text-center text-surface-400">
                No notifications
              </div>
            ) : (
              userNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-surface-200 hover:bg-surface-50 cursor-pointer ${
                    !notification.read ? 'bg-surface-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationTypeColor(notification.type)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-surface-400">{formatTime(notification.createdAt)}</span>
                      </div>
                      <p className="text-sm text-surface-600 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 hover:bg-surface-100 rounded-full"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4 text-surface-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}