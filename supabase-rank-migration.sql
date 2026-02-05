-- Add rank column to users table (can contain multiple ranks separated by commas)
ALTER TABLE users ADD COLUMN rank TEXT DEFAULT 'მომხმარებელი';

-- Create index for rank queries
CREATE INDEX idx_users_rank ON users(rank);

-- Function to get the highest priority rank from comma-separated ranks
CREATE OR REPLACE FUNCTION get_highest_rank(ranks TEXT)
RETURNS TEXT AS $$
DECLARE
  rank_array TEXT[];
  highest_rank TEXT := 'მომხმარებელი';
  rank_priority TEXT[] := ARRAY['ადმინისტრატორი', 'მოდერატორი', 'ბუსტერი', 'მომხმარებელი'];
BEGIN
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

-- Function to validate rank values
CREATE OR REPLACE FUNCTION validate_ranks(ranks TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  rank_array TEXT[];
  valid_ranks TEXT[] := ARRAY['მომხმარებელი', 'ბუსტერი', 'ადმინისტრატორი', 'მოდერატორი'];
  rank_item TEXT;
BEGIN
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

-- Add check constraint for valid ranks (using validation function)
ALTER TABLE users ADD CONSTRAINT valid_ranks 
  CHECK (validate_ranks(rank));
