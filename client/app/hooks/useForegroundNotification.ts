"use client";

import { useEffect } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";
import { useToast } from "../components/Toast";

function getFirebaseApp() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };

  return getApps().length ? getApps()[0] : initializeApp(config);
}

export function useForegroundNotification() {
  const { showToast } = useToast();

  useEffect(() => {
    const app = getFirebaseApp();
    const messaging = getMessaging(app);

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📩 Foreground message:", payload);

      const title = payload.notification?.title || "Notification";
      const body = payload.notification?.body || "";

      // Show styled toast instead of browser alert
      showToast(`${title}${body ? " - " + body : ""}`, "info");
    });

    return () => unsubscribe();
  }, [showToast]);
}