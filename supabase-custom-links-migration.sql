-- Create custom_links table for user-defined links
CREATE TABLE custom_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'globe',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_custom_links_user_id ON custom_links(user_id);
CREATE INDEX idx_custom_links_order ON custom_links(user_id, order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own custom links" ON custom_links;
DROP POLICY IF EXISTS "Users can insert own custom links" ON custom_links;
DROP POLICY IF EXISTS "Users can update own custom links" ON custom_links;
DROP POLICY IF EXISTS "Users can delete own custom links" ON custom_links;
DROP POLICY IF EXISTS "Public custom links are viewable by everyone" ON custom_links;

-- Create policy for users to read their own custom links
CREATE POLICY "Users can view own custom links" ON custom_links
  FOR SELECT USING (user_id IN (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Create policy for users to insert their own custom links
CREATE POLICY "Users can insert own custom links" ON custom_links
  FOR INSERT WITH CHECK (user_id IN (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Create policy for users to update their own custom links
CREATE POLICY "Users can update own custom links" ON custom_links
  FOR UPDATE USING (user_id IN (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Create policy for users to delete their own custom links
CREATE POLICY "Users can delete own custom links" ON custom_links
  FOR DELETE USING (user_id IN (
    SELECT current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Create policy for public read access (for public profiles)
CREATE POLICY "Public custom links are viewable by everyone" ON custom_links
  FOR SELECT USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_links_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_custom_links_updated_at ON custom_links;
CREATE TRIGGER update_custom_links_updated_at 
  BEFORE UPDATE ON custom_links 
  FOR EACH ROW 
  EXECUTE FUNCTION update_custom_links_updated_at_column();
