"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { FiBell } from "react-icons/fi";
import { useNotifications } from "../context/NotificationContext";

export function NotificationDropdown() {
  const { notifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recentNotifications = notifications.slice(0, 5);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 hover:bg-bg-glass rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5 text-text-muted hover:text-text-primary transition-colors" />
    
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-border-default rounded-lg shadow-2xl backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border-default">
            <h3 className="text-sm font-semibold text-text-primary">
              Notifications
            </h3>
           
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <p className="text-sm text-text-muted">Loading...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-text-muted">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border-default">
                {recentNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="p-4 hover:bg-bg-glass/50 transition-colors cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <p className="font-medium text-text-primary text-sm line-clamp-2">
                      {notification.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      {notification.date}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer with View All Link */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-border-default text-center">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-xs text-accent-primary hover:text-accent-secondary font-medium transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
