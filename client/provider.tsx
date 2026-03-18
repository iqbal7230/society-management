"use client";

import { AuthProvider } from "./app/context/AuthContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { NotificationProvider } from "./app/context/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}