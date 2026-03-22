# Society Management (Parasdeep Society)

This repository contains a **resident portal** and an **admin portal** to manage society subscription payments, track monthly dues, send notifications (email + push), and generate reports.

---

## 1) Workflow Diagram (End-to-End)

```mermaid
flowchart TD
  U[Resident] --> L1[Sign in: email/password or Google OAuth]
  A[Admin] --> L2[Sign in: email/password or Google OAuth]

  L1 --> JWT1[Backend issues JWT]
  L2 --> JWT2[Backend issues JWT]

  JWT1 --> R{Role?}
  JWT2 --> R

  R -->|admin| ADMIN[Admin Portal (Next.js)]
  R -->|user| USER[Resident Portal (Next.js)]

  subgraph Resident_Flow[Resident Portal]
    USER --> DASH[Dashboard]
    DASH --> REC1[Load monthly records (GET /records)]
    DASH --> NOT1[Load notifications (GET /notifications)]
    DASH --> FCM1[Foreground push listener (Firebase)]
    USER --> SUBS[Subscriptions list]
    SUBS --> DETAIL[Subscription detail by month]
    USER --> PAYNOW[Pay Now]
    PAYNOW --> PAYAPI[POST /payments]
    USER --> PROFILE[Profile (PUT /auth/profile)]
  end

  subgraph Admin_Flow[Admin Portal]
    ADMIN --> FLATS[Flats CRUD (GET/POST/PUT/DELETE /flats)]
    ADMIN --> USERS[Create resident user (POST /users)]
    ADMIN --> PLANS[Subscription plans (GET/PUT /plans)]
    ADMIN --> ENSURE[Ensure monthly records (POST /records/ensure)]
    ADMIN --> MONTHLY[Monthly Records (GET /records)]
    MONTHLY --> MARKPAID[Mark paid (PUT /records/:id/pay)]
    ADMIN --> PAYMENTENTRY[Manual payment entry (POST /payments)]
    ADMIN --> REPORTS[Reports (GET /reports) -> CSV/Print/PDF]
    ADMIN --> NOTIFY[Send notifications (POST /notifications)]
    NOTIFY --> EMAIL[Email (SMTP/Nodemailer)]
    NOTIFY --> PUSH[Push (FCM via Firebase Admin)]
  end

  subgraph Auth_Flow[Auth Flows]
    LOGIN1[POST /auth/login] --> JWT1
    GOOGLE1[GET /auth/google -> /auth/google/callback] --> JWT2
    FORGOT[POST /auth/forgot-password] --> EMAILRESET[Email reset link]
    RESET[POST /auth/reset-password] --> LOGIN1
  end
```

---

## 2) Architecture

```mermaid
flowchart LR
  subgraph Frontend[Frontend: Next.js App Router]
    FE1[Resident pages\nDashboard / Subscriptions / Pay Now / Profile]
    FE2[Admin pages\nFlats / Plans / Monthly Records / Payments / Reports / Notifications]
    FE3[Contexts\nAuthContext, NotificationContext, ThemeContext]
    FE4[Push client\nFirebase Messaging (foreground)]
  end

  subgraph Backend[Backend: Express API]
    BE1[Routes\n/api/v1/auth, /flats, /plans, /records, /payments, /notifications, /reports, /users, /push-tokens]
    BE2[Controllers\nSQL queries via pg Pool]
    BE3[Auth middleware\nJWT via Authorization header]
    BE4[Google OAuth\nPassport + sessions]
    BE5[Email + Push utils\nNodemailer + Firebase Admin (FCM)]
  end

  DB[(PostgreSQL)]
  FCM[(Firebase Cloud Messaging)]

  FE1 -->|HTTP + Authorization: Bearer JWT| BE1
  FE2 -->|HTTP + Authorization: Bearer JWT| BE1
  BE2 --> DB
  SMTP[(SMTP / Nodemailer)]
  BE5 -->|send emails| SMTP
  BE5 -->|send FCM pushes| FCM
```

### Main runtime components
- **Next.js frontend (`client/`)**
  - Resident portal: `client/app/(user)/*`
  - Admin portal: `client/app/admin/(protected)/*`
  - Login/forgot/reset flows and Google callback pages
  - Calls backend through `client/app/lib/api.ts` (axios + JWT interceptor)
  - Uses Firebase Messaging for **foreground** push notifications
- **Express backend (`society-management-backend/`)**
  - API under `/api/v1/*`
  - JWT authentication (Authorization header) via `middlewares/auth.js`
  - Google OAuth via Passport (`config/passport.js`) and session cookies
  - Email via SMTP (`utils/email.js`)
  - Push via Firebase Admin (`utils/fcm.js`)
- **PostgreSQL database**
  - Schema in `society-management-backend/config/schema.sql`
- **FCM push**
  - Device/browser token stored in `push_tokens`
  - Admin notifications trigger FCM pushes to all/selected flats

---

## 3) All Features

### Resident (User role)
1. **Authentication**
   - Sign in with **email/password** (`POST /auth/login`)
   - Sign in with **Google OAuth** (Passport redirect flow)
   - **Forgot password** (`POST /auth/forgot-password`) and **reset password** (`POST /auth/reset-password`)
   - View profile + update **phone** and optional **password** (`GET/PUT /auth/me` + `/auth/profile`)
2. **Resident portal**
   - **Dashboard**:
     - Shows monthly record for the current month (paid/pending)
     - Shows payment summary (pending amount + pending months)
     - Shows quick action to `Pay Now`
     - Loads **notifications** via polling (every 10 seconds)
   - **Subscriptions**:
     - Monthly dues table (month, amount, status, payment mode/date)
     - Subscription detail page by month
   - **Pay Now**
     - Select a month and record payment (online payment mode)
     - Records payment via `POST /payments`
     - Updates UI optimistically after successful API call
3. **Push notifications (browser foreground)**
   - Resident dashboard registers an FCM token via `POST /push-tokens`
   - Foreground push messages show via toast notifications

### Admin (Admin role)
1. **Flats and residents management**
   - CRUD flats:
     - `GET /flats` (admin only)
     - `POST /flats`, `PUT /flats/:id`, `DELETE /flats/:id`
   - Create resident owner/user linked to a flat:
     - `POST /users` (creates `users` row with `role='user'`)
2. **Subscription plan management**
   - View subscription plans:
     - `GET /plans`
   - Update plan amount per flat type:
     - `PUT /plans/:type`
   - UI note: changes affect **new/ensured monthly records** (existing records are not automatically updated)
3. **Monthly dues management**
   - View monthly records by month:
     - `GET /records?month=YYYY-MM` (admin role can view all flats or filter by `flatId`)
   - Ensure records exist (creates missing `monthly_records` rows for active flats):
     - `POST /records/ensure`
   - Mark specific flat/month as paid:
     - `PUT /records/:id/pay`
4. **Payments**
   - Manual payment entry:
     - `POST /payments` (supports `Cash`, `UPI`, `Online`)
5. **Reports**
   - Monthly/yearly financial summaries:
     - `GET /reports?month=YYYY-MM` or `GET /reports?year=YYYY`
   - Export:
     - Download CSV
     - Print/PDF via browser print dialog
6. **Notifications**
   - Send notifications to:
     - **All flats** or **Selected flats**
     - `POST /notifications` (admin only)
   - Notification delivery:
     - Email via SMTP
     - FCM push notifications using stored `push_tokens`
   - Residents receive notifications via:
     - API polling (`GET /notifications`)
     - Foreground FCM listener (toast)

---

## 4) Database ERD

> Source: `society-management-backend/config/schema.sql`

```mermaid
erDiagram
  users {
    int id PK
    string name
    string email UK
    string password
    string phone
    string role
    int flat_id FK
    string google_id
    datetime created_at
    datetime updated_at
  }

  flats {
    int id PK
    string flat_no
    string owner_name
    string email
    string phone
    string type
    bool is_active
    datetime created_at
    datetime updated_at
  }

  subscription_plans {
    int id PK
    string type
    decimal amount
    int flat_id FK
    datetime updated_at
  }

  monthly_records {
    int id PK
    int flat_id FK
    string month
    decimal amount
    string status
    string payment_mode
    date payment_date
    string paid_by
    datetime created_at
    datetime updated_at
    unique (flat_id, month)
  }

  notifications {
    int id PK
    string title
    text message
    string target
    date date
    string sent_by
    datetime created_at
  }

  password_resets {
    int id PK
    int user_id FK
    string token_hash
    datetime expires_at
    datetime used_at
    datetime created_at
  }

  push_tokens {
    int id PK
    int flat_id FK
    text fcm_token
    string device_type
    datetime created_at
  }

  notification_recipients {
    int id PK
    int notification_id FK
    int flat_id FK
    string read_status
  }

  flats ||--o{ users : assigned
  flats ||--o{ subscription_plans : mapped_override
  flats ||--o{ monthly_records : has
  users ||--o{ password_resets : requests
  flats ||--o{ push_tokens : registers
  notifications ||--o{ notification_recipients : tracking
  flats ||--o{ notification_recipients : tracking
```

### Notes on relationship usage
- `notifications.target` stores a **string** that indicates selection:
  - `all`
  - `selected:<comma-separated flatIds>`
- The schema includes `notification_recipients` for per-recipient tracking, but the current backend controllers **do not write** to it.
- `subscription_plans.flat_id` supports per-flat overrides, but the current admin UI updates only by **flat type** and backend record creation uses plan amounts by **type**.

---

## 5) Complete Project Docs

### Repository structure
- `client/`
  - Next.js application (resident + admin portals)
  - API client: `client/app/lib/api.ts`
  - Auth/Notification providers and push integration
  - Main resident UI: `client/app/(user)/*`
  - Main admin UI: `client/app/admin/(protected)/*`
  - Firebase messaging client code: `client/app/lib/firebaseMessaging.ts`
- `society-management-backend/`
  - Express server entry: `server.js`
  - Routes: `routes/*.routes.js`
  - Controllers: `controllers/*.controller.js`
  - Middleware: `middlewares/auth.js`, `middlewares/validate.js`
  - SQL schema: `config/schema.sql`
  - Push/email helpers: `utils/fcm.js`, `utils/email.js`

---

### Setup & Running

#### 1) PostgreSQL
1. Create a database (example: `society_management`)
2. Run the schema:
   - `psql -d <DB_NAME> -f society-management-backend/config/schema.sql`
3. Create initial admin and seed flats/plans (this repo does not include a seed script in `society-management-backend/scripts/` even though `package.json` references one).

#### 2) Backend
1. Install deps:
   - `cd society-management-backend && npm install`
2. Configure environment variables (see below)
3. Run:
   - `npm run dev` (nodemon)
   - or `npm start`

#### 3) Frontend
1. Install deps:
   - `cd client && npm install`
2. Configure `NEXT_PUBLIC_API_URL` and Firebase env vars
3. Run:
   - `npm run dev`

---

### Environment Variables (by code references)

#### Backend (`society-management-backend`)
- `PORT` (default `8000`)
- `CLIENT_URL` (CORS origin + password-reset links)
- `JWT_SECRET` or `SESSION_SECRET` (used as session secret fallback)
- Database:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Google OAuth / Passport:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Email (Nodemailer):
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - `FROM_EMAIL` (optional; fallback to `SMTP_USER`)
- Push (Firebase Admin / FCM):
  - `FIREBASE_SERVICE_ACCOUNT_JSON`
  - `FIREBASE_PROJECT_ID`

#### Frontend (`client`)
- `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`)
- Firebase web messaging:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- Note: the code references `NEXT_PUBLIC_NEXTAUTH_URL` for Google button redirects; ensure it is set if used.

#### Required web push asset
- The client registers a service worker at `/firebase-messaging-sw.js`.
- Create/serve it from `client/public/firebase-messaging-sw.js` (it is currently listed in `client/.gitignore`).

---

### API Reference (Express routes)

Base path: `/api/v1`

#### Auth
- `POST /auth/login` (public)
  - body: `{ email, password }`
  - returns: `{ token, user }`
- `POST /auth/google-login` (public)
  - body: `{ email, googleId? }`
  - links the Google account to an existing user record (emails must already exist)
- `GET /auth/google` (public, Passport OAuth start)
  - query: `redirect` (optional)
- `GET /auth/google/callback` (public, Passport OAuth callback)
  - redirects to frontend `/auth/callback?token=...&role=...`
- `POST /auth/forgot-password` (public)
  - body: `{ email }`
  - returns: `{ message }` (prevents user enumeration)
- `POST /auth/reset-password` (public)
  - body: `{ token, newPassword }`
  - returns: `{ message }`
- `GET /auth/me` (JWT)
- `PUT /auth/profile` (JWT)
  - body: `{ name?, phone?, password? }`
- `POST /auth/logout` (Passport session logout; frontend mainly clears JWT in localStorage)

#### Flats (admin + residents)
- `GET /flats` (admin only)
  - returns active flats
- `GET /flats/me` (JWT, resident)
  - returns assigned flat details for current user
- `POST /flats` (admin only)
  - body: `{ flatNo, ownerName, email, phone, type }`
- `PUT /flats/:id` (admin only)
- `DELETE /flats/:id` (admin only)
  - soft deletes if monthly records exist

#### Subscription Plans
- `GET /plans` (admin only)
- `GET /plans/my` (JWT, resident)
  - returns the monthly plan amount for the resident's flat (prefers flat-specific plan; falls back to type)
- `PUT /plans/:type` (admin only)
  - body: `{ amount, flatId? }`

#### Monthly Records
- `GET /records?month=YYYY-MM&flatId=...` (JWT)
  - residents: uses their own flat; ignores flatId
  - admins: can optionally filter by `flatId`
  - auto-ensures records exist for the requested month
- `POST /records/ensure` (admin only)
  - body: `{ month }`
  - creates missing `monthly_records` rows for all active flats
- `PUT /records/:id/pay` (admin only)
  - body: `{ mode: "Cash" | "UPI" | "Online" }`
  - sets status to `paid` and stores `payment_mode` + `payment_date`

#### Payments
- `POST /payments` (JWT)
  - body: `{ flatId, month, amount, mode }`
  - residents can only pay for their own flat

#### Notifications
- `GET /notifications` (JWT)
  - admin: returns all notifications
  - resident: returns notifications targeted to their flat (plus `all`)
- `POST /notifications` (admin only)
  - body:
    - `{ title, message, target: "all" | "selected", flatIds? }`
  - sends:
    - Email via SMTP
    - FCM push notifications to affected flats

#### Push tokens
- `POST /push-tokens` (JWT)
  - body: `{ token, deviceType? }`
  - associates FCM token with resident’s flat

#### Users (admin)
- `POST /users` (admin only)
  - body: `{ name, email, phone?, password, flatId }`
  - creates resident user and links to the flat

#### Reports
- `GET /reports?month=YYYY-MM` or `GET /reports?year=YYYY`
  - admin only
  - returns totals and breakdown by `payment_mode`

---

### Business Rules & Implementation Details
- **Monthly records are created on-demand**
  - `GET /records` calls the backend `ensureRecordsForMonth(month)` before selecting records.
- **Plan updates apply to new records**
  - Neither `GET /records` nor monthly records are automatically recalculated after plan updates; ensuring uses current plan amounts.
- **Payments and status**
  - `monthly_records.status` is `pending` by default.
  - Mark paid via:
    - Admin: `PUT /records/:id/pay`
    - Resident: `POST /payments` (records online payment)

---

## Suggested Next Improvements (Optional)
- Add the missing backend seed script (referenced in `society-management-backend/package.json`).
- Wire frontend logout to call `POST /auth/logout` (currently the UI only clears localStorage token).
- Implement `notification_recipients` tracking if per-recipient read status is needed.

