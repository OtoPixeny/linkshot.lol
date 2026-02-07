-- Add music column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS music TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN users.music IS 'User profile music URL for embedding music players (YouTube, SoundCloud, etc.)';
