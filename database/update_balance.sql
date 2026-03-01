-- First, create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- First, check current structure of users table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- If balance column doesn't exist, add it
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0.00;

-- Add updated_at column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create balance_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  description TEXT,
  paypal_transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert user if they don't exist
INSERT INTO users (id, clerk_id, email, name, username, balance) 
VALUES ('a5b21c69-2452-45fe-8e0a-a4ba53fdabf2', 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2', 'user@example.com', 'მომხმარებელი', 'user', 0.00)
ON CONFLICT (id) DO NOTHING;

-- Update specific user balance
UPDATE users 
SET balance = 1921.00,
    updated_at = NOW()
WHERE id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2';

-- Insert transaction record
INSERT INTO balance_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description
) 
SELECT 
    id,
    'topup',
    1921.00,
    0.00,
    1921.00,
    'Initial balance setup'
FROM users 
WHERE id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2'
AND NOT EXISTS (
    SELECT 1 FROM balance_transactions 
    WHERE user_id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2'
    AND description = 'Initial balance setup'
);

-- Check result
SELECT id, email, balance, updated_at 
FROM users 
WHERE id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2';
