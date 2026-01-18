/**
 * NotificationContext
 * Manages application-wide notification state
 */

'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Notification, NotificationContextType, NotificationType } from '@/types/notification';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (!isClient) return;
    
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const withDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(withDates);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, [isClient]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications, isClient]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Play notification sound based on type
    playNotificationSound(notification.type);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper function to play notification sounds
function playNotificationSound(type: NotificationType) {
  // Only play sounds if user preferences allow it and we're on the client
  if (typeof window === 'undefined') return;
  
  const soundEnabled = localStorage.getItem('notificationSoundEnabled') !== 'false';
  if (!soundEnabled) return;

  try {
    let soundFile: string;
    
    switch (type) {
      case 'success':
        soundFile = '/sounds/success.mp3';
        break;
      case 'warning':
        soundFile = '/sounds/warning.mp3';
        break;
      case 'error':
        soundFile = '/sounds/error.mp3';
        break;
      case 'shipment':
        soundFile = '/sounds/shipment.mp3';
        break;
      case 'compliance':
        soundFile = '/sounds/compliance.mp3';
        break;
      case 'info':
      default:
        soundFile = '/sounds/info.mp3';
        break;
    }

    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play().catch(err => {
      // Silently fail if audio can't be played (e.g., user hasn't interacted with page yet)
      console.debug('Could not play notification sound:', err);
    });
  } catch (error) {
    console.debug('Notification sound error:', error);
  }
}
