-- Create users table for balance management
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create premium_subscriptions table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'silver', 'elite', 'gold'
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create balance_transactions table for tracking all balance changes
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL, -- 'topup', 'purchase', 'refund'
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  paypal_transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON premium_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON premium_subscriptions;
DROP POLICY IF EXISTS "Users can view own transactions" ON balance_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON balance_transactions;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = email::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = email::text);

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON premium_subscriptions FOR SELECT USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));
CREATE POLICY "Users can insert own subscriptions" ON premium_subscriptions FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON balance_transactions FOR SELECT USING (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));
CREATE POLICY "Users can insert own transactions" ON balance_transactions FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE email = auth.uid()::text));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle balance top-up
CREATE OR REPLACE FUNCTION handle_balance_topup(
    user_email VARCHAR(255),
    amount DECIMAL(10, 2),
    paypal_transaction_id VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_record users%ROWTYPE;
    new_balance DECIMAL(10, 2);
BEGIN
    -- Get user record
    SELECT * INTO user_record FROM users WHERE email = user_email;
    
    -- If user doesn't exist, create one
    IF user_record IS NULL THEN
        INSERT INTO users (email, balance) VALUES (user_email, amount)
        RETURNING * INTO user_record;
        new_balance := amount;
    ELSE
        -- Update balance
        new_balance := user_record.balance + amount;
        UPDATE users SET balance = new_balance WHERE email = user_email;
    END IF;
    
    -- Record transaction
    INSERT INTO balance_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description,
        paypal_transaction_id
    ) VALUES (
        user_record.id,
        'topup',
        amount,
        user_record.balance,
        new_balance,
        'Balance top-up via PayPal',
        paypal_transaction_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to handle premium purchase
CREATE OR REPLACE FUNCTION handle_premium_purchase(
    user_email VARCHAR(255),
    plan_type VARCHAR(50),
    price DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    user_record users%ROWTYPE;
    new_balance DECIMAL(10, 2);
    expires_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get user record
    SELECT * INTO user_record FROM users WHERE email = user_email;
    
    -- Check if user exists and has sufficient balance
    IF user_record IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    IF user_record.balance < price THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Calculate expiration date (30 days from now)
    expires_date := NOW() + INTERVAL '30 days';
    
    -- Update user balance
    new_balance := user_record.balance - price;
    UPDATE users SET balance = new_balance WHERE email = user_email;
    
    -- Create subscription
    INSERT INTO premium_subscriptions (
        user_id,
        plan_type,
        price,
        status,
        expires_at
    ) VALUES (
        user_record.id,
        plan_type,
        price,
        'active',
        expires_date
    );
    
    -- Record transaction
    INSERT INTO balance_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description
    ) VALUES (
        user_record.id,
        'purchase',
        price,
        user_record.balance,
        new_balance,
        'Premium purchase: ' || plan_type
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user balance
CREATE OR REPLACE FUNCTION get_user_balance(user_email VARCHAR(255))
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    user_balance DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(balance, 0) INTO user_balance 
    FROM users 
    WHERE email = user_email;
    
    RETURN COALESCE(user_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has active premium
CREATE OR REPLACE FUNCTION has_active_premium(user_email VARCHAR(255))
RETURNS BOOLEAN AS $$
DECLARE
    is_active BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM premium_subscriptions ps
        JOIN users u ON ps.user_id = u.id
        WHERE u.email = user_email 
        AND ps.status = 'active'
        AND ps.expires_at > NOW()
    ) INTO is_active;
    
    RETURN COALESCE(is_active, FALSE);
END;
$$ LANGUAGE plpgsql;
