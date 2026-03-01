-- Disable RLS temporarily for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions DISABLE ROW LEVEL SECURITY;

-- Or update policies to allow service role
DROP POLICY IF EXISTS "Users can insert own transactions" ON balance_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON balance_transactions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON premium_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON premium_subscriptions;

-- Create new policies that allow service role
CREATE POLICY "Service role can insert transactions" ON balance_transactions
FOR INSERT WITH CHECK (current_setting('request.jwt.claims.role') = 'service_role');

CREATE POLICY "Service role can view transactions" ON balance_transactions
FOR SELECT USING (current_setting('request.jwt.claims.role') = 'service_role');

CREATE POLICY "Service role can insert subscriptions" ON premium_subscriptions
FOR INSERT WITH CHECK (current_setting('request.jwt.claims.role') = 'service_role');

CREATE POLICY "Service role can view subscriptions" ON premium_subscriptions
FOR SELECT USING (current_setting('request.jwt.claims.role') = 'service_role');

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
