-- Function to automatically update ranks for top 3 users
-- This function should be called periodically or triggered when views are updated

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
    
    -- Log the update (optional)
    RAISE NOTICE 'Top user ranks updated. % users affected.', updated_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update ranks when views are incremented
CREATE OR REPLACE FUNCTION trigger_rank_update_on_views()
RETURNS trigger AS $$
BEGIN
    -- Update ranks for top users after view increment
    PERFORM update_top_user_ranks();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after views are updated
-- Note: This trigger may cause performance issues with high traffic
-- Consider calling the function periodically instead
-- DROP TRIGGER IF EXISTS auto_update_rank_trigger ON users;
-- CREATE TRIGGER auto_update_rank_trigger
--     AFTER UPDATE OF views ON users
--     FOR EACH ROW
--     EXECUTE FUNCTION trigger_rank_update_on_views();

-- Alternative: Create a scheduled job to run every few minutes/hours
-- This would require pg_cron extension:
-- SELECT cron.schedule('update-top-ranks', '*/5 * * * *', 'SELECT update_top_user_ranks();');

-- Manual execution for testing:
-- SELECT update_top_user_ranks();
