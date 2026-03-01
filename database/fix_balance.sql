-- Update user balance to 1921
UPDATE users 
SET balance = 1921.00,
    updated_at = NOW()
WHERE id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2';

-- Insert transaction record if it doesn't exist
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
    'Balance correction to 1921'
FROM users 
WHERE id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2'
AND NOT EXISTS (
    SELECT 1 FROM balance_transactions 
    WHERE user_id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2'
    AND description = 'Balance correction to 1921'
);

-- Check result
SELECT id, email, balance, updated_at 
FROM users 
WHERE id = 'a5b21c69-2452-45fe-8e0a-a4ba53fdabf2';
