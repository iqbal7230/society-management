"use client";

import { AuthProvider } from "./app/context/AuthContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { NotificationProvider } from "./app/context/NotificationContext";
import { ForegroundNotificationProvider } from "./app/context/ForegroundNotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ForegroundNotificationProvider>
            {children}
          </ForegroundNotificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}