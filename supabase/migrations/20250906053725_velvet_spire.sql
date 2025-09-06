/*
  # Rural Tech Store Database Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `affiliate_links` - Generated affiliate links tracking
    - `earnings` - User earnings from affiliate commissions
    - `transactions` - Transaction history for withdrawals
    - `analytics_data` - Performance analytics data
    - `notifications` - User notifications system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for real-time subscriptions

  3. Functions
    - Update user profile function
    - Calculate earnings function
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone_number text,
  address jsonb,
  payment_details jsonb,
  member_since timestamptz DEFAULT now(),
  total_earnings decimal(10,2) DEFAULT 0,
  available_balance decimal(10,2) DEFAULT 0,
  pending_earnings decimal(10,2) DEFAULT 0,
  total_withdrawn decimal(10,2) DEFAULT 0,
  cuelinks_user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliate Links Table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  affiliate_url text NOT NULL,
  brand text,
  product_name text,
  commission_rate decimal(5,2),
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  earnings decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Earnings Table
CREATE TABLE IF NOT EXISTS earnings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_link_id uuid REFERENCES affiliate_links(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  commission_rate decimal(5,2),
  brand text,
  product_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid')),
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('withdrawal', 'earning', 'bonus')),
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method text,
  reference_id text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics Data Table
CREATE TABLE IF NOT EXISTS analytics_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  earnings decimal(10,2) DEFAULT 0,
  top_brands jsonb DEFAULT '[]',
  top_products jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for affiliate_links
CREATE POLICY "Users can view own affiliate links"
  ON affiliate_links FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate links"
  ON affiliate_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate links"
  ON affiliate_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for earnings
CREATE POLICY "Users can view own earnings"
  ON earnings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own earnings"
  ON earnings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics_data
CREATE POLICY "Users can view own analytics"
  ON analytics_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON analytics_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_user_earnings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    total_earnings = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM earnings 
      WHERE user_id = NEW.user_id AND status = 'confirmed'
    ),
    pending_earnings = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM earnings 
      WHERE user_id = NEW.user_id AND status = 'pending'
    ),
    available_balance = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM earnings 
      WHERE user_id = NEW.user_id AND status = 'confirmed'
    ) - (
      SELECT COALESCE(SUM(amount), 0) 
      FROM transactions 
      WHERE user_id = NEW.user_id AND type = 'withdrawal' AND status = 'completed'
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_earnings_trigger
  AFTER INSERT OR UPDATE ON earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_earnings();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, member_since)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();