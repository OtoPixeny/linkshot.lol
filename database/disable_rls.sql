-- Disable RLS completely for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions DISABLE ROW LEVEL SECURITY;

-- Check if policies are disabled
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'balance_transactions', 'premium_subscriptions');
