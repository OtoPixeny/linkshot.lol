-- Add views column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create function to increment user views
CREATE OR REPLACE FUNCTION increment_user_views(user_username TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_views INTEGER;
BEGIN
  -- Update the views count for the specified username
  UPDATE users 
  SET views = views + 1 
  WHERE username = user_username
  RETURNING views INTO current_views;
  
  -- Return the updated views count
  RETURN current_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION increment_user_views(TEXT) TO anon, authenticated;
