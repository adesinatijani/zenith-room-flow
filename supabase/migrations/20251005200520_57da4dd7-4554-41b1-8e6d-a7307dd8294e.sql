-- Fix infinite recursion in profiles RLS policies
-- Create security definer functions to safely check user's current role and department

-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create security definer function to get user's role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id LIMIT 1;
  RETURN user_role;
END;
$$;

-- Create security definer function to get user's department without recursion
CREATE OR REPLACE FUNCTION public.get_user_department(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_dept text;
BEGIN
  SELECT department INTO user_dept FROM public.profiles WHERE id = user_id LIMIT 1;
  RETURN user_dept;
END;
$$;

-- Recreate the UPDATE policy using security definer functions
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Use security definer functions to prevent infinite recursion
  (role IS NULL OR role = public.get_user_role(auth.uid())) AND
  (department IS NULL OR department = public.get_user_department(auth.uid()))
);