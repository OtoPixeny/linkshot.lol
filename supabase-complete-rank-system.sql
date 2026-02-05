-- Complete Rank System Setup for MySocials
-- This file includes everything needed for the rank management system

-- Step 1: Add rank column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='rank'
    ) THEN
        ALTER TABLE users ADD COLUMN rank TEXT DEFAULT 'მომხმარებელი';
        RAISE NOTICE 'Added rank column to users table';
    ELSE
        RAISE NOTICE 'Rank column already exists in users table';
    END IF;
END $$;

-- Step 2: Create index for rank queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(rank);

-- Step 3: Function to get the highest priority rank from comma-separated ranks
CREATE OR REPLACE FUNCTION get_highest_rank(ranks TEXT)
RETURNS TEXT AS $$
DECLARE
  rank_array TEXT[];
  highest_rank TEXT := 'მომხმარებელი';
  rank_priority TEXT[] := ARRAY['ადმინისტრატორი', 'მოდერატორი', 'სპონსორი', 'პარტნიორი', 'ბუსტერი', 'მომხმარებელი'];
BEGIN
  -- Handle NULL ranks
  IF ranks IS NULL THEN
    RETURN 'მომხმარებელი';
  END IF;
  
  -- Split comma-separated ranks into array
  rank_array := string_to_array(ranks, ',');
  
  -- Trim whitespace from each rank
  FOR i IN 1..array_length(rank_array, 1) LOOP
    rank_array[i] := trim(rank_array[i]);
  END LOOP;
  
  -- Find highest priority rank
  FOR i IN 1..array_length(rank_priority, 1) LOOP
    IF rank_priority[i] = ANY(rank_array) THEN
      highest_rank := rank_priority[i];
      EXIT;
    END IF;
  END LOOP;
  
  RETURN highest_rank;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Function to validate rank values
CREATE OR REPLACE FUNCTION validate_ranks(ranks TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  rank_array TEXT[];
  valid_ranks TEXT[] := ARRAY['მომხმარებელი', 'ბუსტერი', 'ადმინისტრატორი', 'მოდერატორი', 'sponsor', 'სპონსორი', 'პარტნიორი'];
  rank_item TEXT;
BEGIN
  -- Handle NULL ranks
  IF ranks IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Split comma-separated ranks into array
  rank_array := string_to_array(ranks, ',');
  
  -- Check each rank
  FOR i IN 1..array_length(rank_array, 1) LOOP
    rank_item := trim(rank_array[i]);
    IF NOT (rank_item = ANY(valid_ranks)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Add check constraint for valid ranks (drop if exists first)
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_ranks;
ALTER TABLE users ADD CONSTRAINT valid_ranks 
  CHECK (validate_ranks(rank));

-- Step 6: Function to automatically update ranks for top 3 users
CREATE OR REPLACE FUNCTION update_top_user_ranks()
RETURNS void AS $$
DECLARE
    top_users RECORD;
    current_boosters RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Create temporary table for current top 3 users
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_top_users AS
    SELECT username, name, avatar_url, views, rank
    FROM users
    WHERE views IS NOT NULL 
    AND username IS NOT NULL
    ORDER BY views DESC
    LIMIT 3;
    
    -- Remove "ბუსტერი" rank from users who are no longer in top 3
    FOR current_boosters IN 
        SELECT username, rank 
        FROM users 
        WHERE rank LIKE '%ბუსტერი%'
        AND username NOT IN (SELECT username FROM temp_top_users)
    LOOP
        -- Remove ბუსტერი from the rank string
        UPDATE users 
        SET rank = CASE 
            WHEN rank = 'ბუსტერი' THEN 'მომხმარებელი'
            WHEN rank LIKE 'ბუსტერი, %' THEN SUBSTRING(rank FROM 12)
            WHEN rank LIKE '%, ბუსტერი' THEN SUBSTRING(rank FROM 1 FOR LENGTH(rank) - 11)
            WHEN rank LIKE '%, ბუსტერი, %' THEN REPLACE(rank, ', ბუსტერი', '')
            ELSE rank
        END
        WHERE username = current_boosters.username;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    -- Add "ბუსტერი" rank to top 3 users who don't have it
    FOR top_users IN 
        SELECT username, rank 
        FROM temp_top_users
        WHERE rank NOT LIKE '%ბუსტერი%'
    LOOP
        -- Add ბუსტერი to the rank string
        UPDATE users 
        SET rank = CASE 
            WHEN rank = 'მომხმარებელი' OR rank IS NULL THEN 'ბუსტერი'
            ELSE rank || ', ბუსტერი'
        END
        WHERE username = top_users.username;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    -- Drop temporary table
    DROP TABLE IF EXISTS temp_top_users;
    
    -- Log the update
    RAISE NOTICE 'Top user ranks updated. % users affected.', updated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Function to add rank to specific user
CREATE OR REPLACE FUNCTION add_user_rank(target_username TEXT, new_rank TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_ranks TEXT;
    updated_ranks TEXT;
    rank_array TEXT[];
BEGIN
    -- Validate the new rank
    IF NOT validate_ranks(new_rank) THEN
        RAISE EXCEPTION 'Invalid rank: %', new_rank;
    END IF;
    
    -- Get current user ranks
    SELECT rank INTO current_ranks FROM users WHERE username = target_username;
    
    IF current_ranks IS NULL THEN
        current_ranks := 'მომხმარებელი';
    END IF;
    
    -- Split and check if rank already exists
    rank_array := string_to_array(current_ranks, ',');
    FOR i IN 1..array_length(rank_array, 1) LOOP
        rank_array[i] := trim(rank_array[i]);
        IF rank_array[i] = new_rank THEN
            RETURN TRUE; -- Rank already exists
        END IF;
    END LOOP;
    
    -- Add the new rank
    rank_array := array_append(rank_array, new_rank);
    updated_ranks := array_to_string(rank_array, ', ');
    
    -- Update user
    UPDATE users SET rank = updated_ranks WHERE username = target_username;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Function to remove rank from specific user
CREATE OR REPLACE FUNCTION remove_user_rank(target_username TEXT, rank_to_remove TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_ranks TEXT;
    updated_ranks TEXT;
    rank_array TEXT[];
    filtered_array TEXT[];
BEGIN
    -- Get current user ranks
    SELECT rank INTO current_ranks FROM users WHERE username = target_username;
    
    IF current_ranks IS NULL THEN
        RETURN TRUE; -- Nothing to remove
    END IF;
    
    -- Split and filter out the rank to remove
    rank_array := string_to_array(current_ranks, ',');
    filtered_array := ARRAY[]::TEXT[];
    
    FOR i IN 1..array_length(rank_array, 1) LOOP
        rank_array[i] := trim(rank_array[i]);
        IF rank_array[i] != rank_to_remove THEN
            filtered_array := array_append(filtered_array, rank_array[i]);
        END IF;
    END LOOP;
    
    -- If no ranks left, default to "მომხმარებელი"
    IF array_length(filtered_array, 1) IS NULL OR array_length(filtered_array, 1) = 0 THEN
        updated_ranks := 'მომხმარებელი';
    ELSE
        updated_ranks := array_to_string(filtered_array, ', ');
    END IF;
    
    -- Update user
    UPDATE users SET rank = updated_ranks WHERE username = target_username;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Grant necessary permissions for these functions
-- Note: Adjust permissions based on your Supabase setup
GRANT EXECUTE ON FUNCTION update_top_user_ranks() TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_rank(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_rank(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_highest_rank(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_ranks(TEXT) TO authenticated;

-- Step 10: Test the system (optional - can be commented out in production)
-- SELECT update_top_user_ranks();

-- Instructions:
-- 1. Run this SQL file in your Supabase SQL editor
-- 2. The rank system will be fully set up
-- 3. Call update_top_user_ranks() to update ranks for top 3 users
-- 4. Use add_user_rank(username, rank) and remove_user_rank(username, rank) for manual rank management
