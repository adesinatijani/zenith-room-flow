-- Fix security issue: Set search_path for the hotel settings trigger function
CREATE OR REPLACE FUNCTION prevent_multiple_hotel_settings()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM hotel_settings) >= 1 THEN
    RAISE EXCEPTION 'Only one hotel_settings row is allowed';
  END IF;
  RETURN NEW;
END;
$$;