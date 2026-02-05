-- Create users table for MySocials application
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  image TEXT,
  email TEXT NOT NULL,
  
  -- Social media links
  instagram TEXT,
  facebook TEXT,
  github TEXT,
  snapchat TEXT,
  youtube TEXT,
  linkedin TEXT,
  twitter TEXT,
  threads TEXT,
  reddit TEXT,
  stackoverflow TEXT,
  leetcode TEXT,
  codeforces TEXT,
  hackerrank TEXT,
  codechef TEXT,
  geeksforgeeks TEXT,
  twitch TEXT,
  soundcloud TEXT,
  spotify TEXT,
  "apple music" TEXT,
  discord TEXT,
  telegram TEXT,
  whatsapp TEXT,
  skype TEXT,
  amazon TEXT,
  shopify TEXT,
  "ko-fi" TEXT,
  "buy me a coffee" TEXT,
  patreon TEXT,
  website TEXT,
  blog TEXT,
  phone TEXT,
  accessKey TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_username ON users(username);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;

-- Create policy for users to read their own data (using clerk_id)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_id IN (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Create policy for users to update their own data (using clerk_id)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id IN (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Create policy for users to insert their own data (using clerk_id)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_id IN (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Create policy for public read access (for public profiles)
CREATE POLICY "Public profiles are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user views
CREATE OR REPLACE FUNCTION increment_user_views(user_username TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_views INTEGER;
BEGIN
  -- Update the views count for the specified username
  UPDATE users 
  SET views = views + 1 
  WHERE username = user_username
  RETURNING views INTO current_views;
  
  -- Return the updated views count
  RETURN current_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
