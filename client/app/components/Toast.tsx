"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef} from "react";
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastMessageRef = useRef<{ message: string; time: number } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const now = Date.now();

      // Deduplicate: prevent same message within 500ms
      if (lastMessageRef.current) {
        const { message: lastMsg, time: lastTime } = lastMessageRef.current;
        if (lastMsg === message && now - lastTime < 500) {
          console.log("🚫 Toast deduplicated (same message within 500ms)");
          return;
        }
      }

      lastMessageRef.current = { message, time: now };
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const icons = {
    success: <HiCheckCircle />,
    error: <HiExclamationCircle />,
    info: <HiInformationCircle />,
  };

  const colorMap = {
    success: "bg-emerald-900 border-emerald-500/30 text-success",
    error: "bg-red-950 border-red-500/30 text-danger",
    info: "bg-blue-950 border-blue-500/30 text-info",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`py-3.5 px-5 rounded-lg text-sm font-medium shadow-2xl slide-in-right flex items-center gap-2.5 min-w-[300px] border ${colorMap[toast.type]}`}
          >
            {icons[toast.type]}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
