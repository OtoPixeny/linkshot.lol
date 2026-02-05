-- Quick fix for RLS issues - Disable RLS temporarily to allow Clerk authentication to work
-- This will allow the application to work while we properly integrate Clerk with Supabase

-- Disable Row Level Security temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies instead:
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;

-- Create very permissive policies (for development only)
-- CREATE POLICY "Enable all operations for users table" ON users FOR ALL USING (true);

-- Choose ONE approach:
-- 1. Disable RLS completely (uncomment the line below)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. OR enable permissive policies (uncomment the line below)
-- CREATE POLICY "Enable all operations for users table" ON users FOR ALL USING (true);
