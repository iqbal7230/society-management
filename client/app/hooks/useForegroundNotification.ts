"use client";

import { useEffect, useRef } from "react";
import { setupForegroundNotificationListener } from "../lib/firebaseMessaging";
import { useToast } from "../components/Toast";


export function useForegroundNotification() {
  const { showToast } = useToast();
  const initRef = useRef(false);

  useEffect(() => {
  
    if (initRef.current) return;
    initRef.current = true;

    setupForegroundNotificationListener((title, body) => {
      showToast(`${title}${body ? " - " + body : ""}`, "info");
    });
  }, [showToast]);
}