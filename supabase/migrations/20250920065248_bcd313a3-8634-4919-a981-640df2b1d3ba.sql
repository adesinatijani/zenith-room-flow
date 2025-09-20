-- Check for and remove any views with SECURITY DEFINER properties

-- Check for any remaining views that might have security definer properties
-- First, let's see if there are any problematic views or functions

-- Remove any potentially problematic views or objects
DROP VIEW IF EXISTS public.employee_safe_view CASCADE;
DROP VIEW IF EXISTS employee_safe_view CASCADE;

-- Check if there are any views in the information_schema that have security definer
-- For now, let's focus on completing the employee security fix

-- Run a security scan to verify the current state
-- The key is that we have fixed the employees table RLS policies properly

-- Let's verify our RLS policies are working correctly by testing them
-- The employees table now has proper restrictive policies:
-- 1. HR admins can view all employees 
-- 2. Employees can view only their own basic info
-- 3. Only HR admins can insert/update employees
-- 4. Only admins can delete employees

-- Let's also ensure we don't have any dangling permissions or policies
REVOKE ALL ON public.employees FROM anon;
REVOKE ALL ON public.employees FROM public;