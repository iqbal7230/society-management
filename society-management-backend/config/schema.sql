-- Society Subscription Management Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  flat_id INTEGER,
  google_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flats table
CREATE TABLE IF NOT EXISTS flats (
  id SERIAL PRIMARY KEY,
  flat_no VARCHAR(20) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  type VARCHAR(10) NOT NULL CHECK (type IN ('1BHK', '2BHK', '3BHK')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('1BHK', '2BHK', '3BHK')),
  amount NUMERIC(10, 2) NOT NULL,
  flat_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allow one default plan per type (flat_id NULL) and optional per-flat overrides.
-- If the old UNIQUE(type) constraint exists, drop it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_plans_type_key'
  ) THEN
    ALTER TABLE subscription_plans DROP CONSTRAINT subscription_plans_type_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_plans_type_flat_unique'
  ) THEN
    ALTER TABLE subscription_plans
      ADD CONSTRAINT subscription_plans_type_flat_unique
      UNIQUE (type, flat_id);
  END IF;
END $$;

-- Monthly records table
CREATE TABLE IF NOT EXISTS monthly_records (
  id SERIAL PRIMARY KEY,
  flat_id INTEGER NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  payment_mode VARCHAR(10) DEFAULT '' CHECK (payment_mode IN ('Cash', 'UPI', 'Online', '')),
  payment_date DATE,
  paid_by VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (flat_id, month)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'all',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for users.flat_id after flats table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_flat'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_flat
      FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Link subscription_plans to flats (optional per-flat overrides)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscription_plans_flat'
  ) THEN
    ALTER TABLE subscription_plans
      ADD CONSTRAINT fk_subscription_plans_flat
      FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Push tokens for Supabase Cloud Messaging / device registration
CREATE TABLE IF NOT EXISTS push_tokens (
  id SERIAL PRIMARY KEY,
  flat_id INTEGER NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_type VARCHAR(50) DEFAULT 'web',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional per-recipient notification tracking (for read-status etc.)
CREATE TABLE IF NOT EXISTS notification_recipients (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  flat_id INTEGER NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
  read_status VARCHAR(20) NOT NULL DEFAULT 'unread'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_records_month ON monthly_records(month);
CREATE INDEX IF NOT EXISTS idx_monthly_records_flat_id ON monthly_records(flat_id);
CREATE INDEX IF NOT EXISTS idx_monthly_records_status ON monthly_records(status);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
