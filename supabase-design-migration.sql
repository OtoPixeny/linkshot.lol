-- Add design column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS design JSONB DEFAULT '{
  "theme": "default",
  "backgroundColor": "#ffffff",
  "buttonColor": "#6366f1",
  "textColor": "#000000",
  "cardStyle": "rounded",
  "layout": "centered"
}'::jsonb;

-- Add comment to describe the column
COMMENT ON COLUMN users.design IS 'User profile design settings including theme, colors, and layout preferences';
