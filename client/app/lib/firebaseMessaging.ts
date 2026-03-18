import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

function getFirebaseApp() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) {
    return null;
  }

  return getApps().length ? getApps()[0] : initializeApp(config);
}

export async function getFcmWebToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;

  const app = getFirebaseApp();
  if (!app) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return null;

  const messaging = getMessaging(app);
  const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

  return await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
}

