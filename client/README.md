# 🏘️ Society Management — Client (Frontend)

The **Next.js** frontend for the Society Management System, providing both a **Resident Portal** and an **Admin Portal** with responsive UI, dark/light theme, real-time push notifications, and interactive charts.

---

## 🛠️ Tech Stack

| Technology       | Version  | Purpose                           |
| ---------------- | -------- | --------------------------------- |
| **Next.js**      | 16.1.6   | React framework with App Router   |
| **React**        | 19.2.3   | UI library                        |
| **TypeScript**   | ^5       | Type safety                       |
| **Tailwind CSS** | ^4       | Utility-first styling             |
| **Axios**        | ^1.12.2  | HTTP client with JWT interceptor  |
| **Firebase**     | ^12.10.0 | Push notifications (FCM web)      |
| **Recharts**     | ^3.8.0   | Dashboard charts & visualizations |
| **React Icons**  | ^5.6.0   | Icon library                      |

---

## 📁 Project Structure

```
client/
├── app/
│   ├── (user)/                          # Resident Portal (protected)
│   │   ├── dashboard/page.tsx           #   Dashboard — summary & quick actions
│   │   ├── subscriptions/              #   Monthly dues list & detail
│   │   ├── pay-now/page.tsx            #   Online payment page
│   │   ├── profile/page.tsx            #   User profile management
│   │   └── layout.tsx                  #   Resident sidebar + nav layout
│   │
│   ├── admin/(protected)/              # Admin Portal (protected)
│   │   ├── dashboard/page.tsx          #   Admin dashboard & overview
│   │   ├── flats/page.tsx              #   CRUD flats management
│   │   ├── subscriptions/page.tsx      #   Subscription plan management
│   │   ├── monthly-records/page.tsx    #   Monthly dues tracking
│   │   ├── payment-entry/page.tsx      #   Manual payment entry
│   │   ├── reports/page.tsx            #   Financial reports (CSV/PDF)
│   │   ├── notifications/page.tsx      #   Send email & push notifications
│   │   ├── profile/page.tsx            #   Admin profile management
│   │   └── layout.tsx                  #   Admin sidebar + nav layout
│   │
│   ├── login/page.tsx                  # Login page
│   ├── forgot-password/page.tsx        # Forgot password
│   ├── reset-password/page.tsx         # Reset password
│   ├── auth/                           # Google OAuth callback handler
│   │
│   ├── components/                     # Shared UI Components
│   │   ├── LoginForm.tsx               #   Login form (email + Google)
│   │   ├── ForgotPasswordForm.tsx      #   Forgot password form
│   │   ├── NotificationDropdown.tsx    #   Bell icon + notifications list
│   │   ├── ConfirmModal.tsx            #   Reusable confirmation dialog
│   │   └── Toast.tsx                   #   Toast notification component
│   │
│   ├── context/                        # React Contexts
│   │   ├── AuthContext.tsx             #   Authentication state & JWT
│   │   ├── NotificationContext.tsx     #   Notification polling & state
│   │   ├── ForegroundNotificationContext.tsx  # FCM foreground listener
│   │   └── ThemeContext.tsx            #   Dark/light theme toggle
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   ├── useForegroundNotification.ts  # FCM foreground hook
│   │   └── useRegisterPushToken.ts       # Push token registration
│   │
│   ├── lib/                            # Utilities & Configuration
│   │   ├── api.ts                      #   Axios instance + JWT interceptor
│   │   ├── data.ts                     #   Static data / constants
│   │   └── firebaseMessaging.ts        #   Firebase messaging setup
│   │
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Home page (redirects to login)
│
├── provider.tsx                        # Context providers wrapper
├── public/                             # Static assets
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn / pnpm / bun)
- The backend server running at `http://localhost:8000` (see root [README](../README.md))

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Firebase Web (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Other Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start dev server (port 3000) |
| `npm run build` | Create production build      |
| `npm run start` | Start production server      |
| `npm run lint`  | Run ESLint                   |

---

## ✨ Features

### 🔑 Authentication

- Email/password login
- **Google OAuth 2.0** social login
- Forgot & reset password flow
- JWT stored in `localStorage` with Axios interceptor for automatic `Authorization` header injection

### 👤 Resident Portal (`/dashboard`, `/subscriptions`, `/pay-now`, `/profile`)

- **Dashboard** — Current month status (paid/pending), pending amount summary, quick "Pay Now" action
- **Subscriptions** — Monthly dues table with payment status, amount, mode, and date
- **Pay Now** — Select month and record online payment
- **Notifications** — Bell icon with unread count badge, dropdown list, mark as read
- **Push Notifications** — Browser FCM push (foreground toast)
- **Profile** — Update name, phone, and password

### 🛡️ Admin Portal (`/admin/dashboard`, `/admin/flats`, `/admin/reports`, etc.)

- **Dashboard** — Society overview & key metrics with Recharts visualizations
- **Flats Management** — Create, edit, soft-delete flats with owner details
- **Resident Users** — Create resident accounts linked to flats
- **Subscription Plans** — View and update plan amounts by flat type
- **Monthly Records** — Ensure records for a month, view all flats, mark as paid
- **Payment Entry** — Manual payment recording (Cash / UPI / Online)
- **Reports** — Monthly/yearly financial summaries with CSV download & Print/PDF export
- **Notifications** — Send email + push notifications to all or selected flats

### 🎨 UI/UX

- **Dark / Light** theme toggle via `ThemeContext`
- Responsive sidebar navigation
- Toast notifications for success/error feedback
- Confirmation modals for destructive actions
- Charts & visualizations with **Recharts**

---

## 🗂️ Architecture

### Context Providers

All contexts are wrapped in a single `provider.tsx` at the app root:

| Context                         | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `AuthContext`                   | JWT auth state, login/logout, user data |
| `NotificationContext`           | Notification polling, unread count      |
| `ForegroundNotificationContext` | FCM foreground message listener         |
| `ThemeContext`                  | Dark/light theme toggle                 |

### API Layer (`lib/api.ts`)

- Centralized **Axios instance** with `baseURL` from `NEXT_PUBLIC_API_URL`
- Request interceptor attaches `Authorization: Bearer <token>` from `localStorage`
- Used across all pages and contexts for consistent API communication

### Firebase Integration (`lib/firebaseMessaging.ts`)

- Initializes Firebase app and messaging for **FCM web push**
- `useRegisterPushToken` hook registers the browser's FCM token with the backend
- `useForegroundNotification` hook listens for foreground messages and displays toasts

---
