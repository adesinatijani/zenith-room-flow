-- Enable leaked password protection and strengthen password policies
-- This will be handled through Supabase Auth settings, but we can ensure proper setup

-- First, let's make sure we have proper password policies in place
-- Note: Password strength settings are managed through Supabase Auth UI, 
-- but we can prepare the database for better security

-- Create a function to validate strong passwords (backup validation)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check minimum length (8 characters)
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter  
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one digit
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Password meets all criteria
  RETURN true;
END;
$$;