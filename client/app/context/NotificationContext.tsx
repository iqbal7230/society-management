"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiGetNotifications, ApiNotification } from "../lib/api";

interface NotificationContextType {
  notifications: ApiNotification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGetNotifications();
      setNotifications(data);
      // Calculate unread - all notifications are unread by default since we don't have read status in API
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Load notifications on mount
  useEffect(() => {
    refreshNotifications();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refreshNotifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
