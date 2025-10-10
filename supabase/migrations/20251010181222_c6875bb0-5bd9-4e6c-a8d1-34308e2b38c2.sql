-- Fix duplicate hotel_settings rows by keeping only the most recent one
DO $$
DECLARE
  latest_id uuid;
BEGIN
  -- Get the ID of the most recently updated row
  SELECT id INTO latest_id
  FROM hotel_settings
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- Delete all other rows
  DELETE FROM hotel_settings
  WHERE id != latest_id;
END $$;

-- Create a trigger function to prevent multiple rows
CREATE OR REPLACE FUNCTION prevent_multiple_hotel_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM hotel_settings) >= 1 THEN
    RAISE EXCEPTION 'Only one hotel_settings row is allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires before insert
DROP TRIGGER IF EXISTS enforce_single_hotel_settings ON hotel_settings;
CREATE TRIGGER enforce_single_hotel_settings
  BEFORE INSERT ON hotel_settings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_hotel_settings();