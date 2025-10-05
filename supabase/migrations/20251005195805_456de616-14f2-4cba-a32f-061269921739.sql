-- Fix profiles RLS policy to allow users to view their own profile
-- Drop existing restrictive policies and create proper ones

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Ensure users can update their own basic info (not role/department)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent users from changing their own role/department
  role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
  department = (SELECT department FROM public.profiles WHERE id = auth.uid())
);