-- Fix the RLS policy for employees to properly restrict access

-- Drop the current policy that might not be working correctly
DROP POLICY IF EXISTS "Employees can view own basic info only" ON public.employees;

-- Create a more restrictive policy that only allows authenticated users to see their own data
-- and HR staff to see all data
CREATE POLICY "Authenticated employees can view own data only"
ON public.employees
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL 
  AND (
    -- HR staff can see all employee data
    public.is_hr_admin()
    OR 
    -- Regular employees can only see their own data based on email match
    (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

-- Also ensure that anonymous users cannot access the table at all
-- This should already be covered by RLS, but let's be explicit
REVOKE ALL ON public.employees FROM anon;
REVOKE ALL ON public.employees FROM public;

-- Grant only necessary permissions to authenticated users
GRANT SELECT ON public.employees TO authenticated;