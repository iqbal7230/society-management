"use client";

import { createContext, useContext, useEffect, ReactNode, useRef } from "react";
import { setupForegroundNotificationListener } from "../lib/firebaseMessaging";
import { useToast } from "../components/Toast";

const ForegroundNotificationContext = createContext<void>(undefined);


 
export function ForegroundNotificationProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initRef.current) return;
    initRef.current = true;

    try {
      // Set up the Firebase foreground listener using shared setup
      setupForegroundNotificationListener((title, body) => {
        showToast(`${title}${body ? " - " + body : ""}`, "info");
      });

      // Keep listener alive for app lifetime - no cleanup
    } catch (error) {
      console.error("Failed to setup foreground notification:", error);
    }
  }, [showToast]);

  return (
    <ForegroundNotificationContext.Provider value={undefined}>
      {children}
    </ForegroundNotificationContext.Provider>
  );
}



