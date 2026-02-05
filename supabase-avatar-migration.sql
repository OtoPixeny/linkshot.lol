-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Create index for faster queries on avatar_url
CREATE INDEX idx_users_avatar_url ON users(avatar_url);

-- Add comment to describe the column
COMMENT ON COLUMN users.avatar_url IS 'URL of the user''s avatar image from Clerk';
