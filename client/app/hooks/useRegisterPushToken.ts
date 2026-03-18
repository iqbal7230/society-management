"use client";

import { useEffect } from "react";
import { apiRegisterPushToken } from "../lib/api";
import { getFcmWebToken } from "../lib/firebaseMessaging";


// This hook expects that the client (web or mobile)
// has already obtained an FCM push token string.
// You can call it with that token (or omit it for web)
// against the current user's flat in the backend.
export function useRegisterPushToken(token?: string | null) {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const t = token || (await getFcmWebToken());
      if (!t || cancelled) return;
      await apiRegisterPushToken(t);
    };

    run().catch(() => {
      // Best-effort only; failures are logged server-side.
    });

    return () => {
      cancelled = true;
    };
  }, [token]);
}

