-- Comprehensive fix for employees table security

-- First, ensure RLS is enabled (it should already be)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "HR admins can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated employees can view own data only" ON public.employees;
DROP POLICY IF EXISTS "Only HR admins can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Only HR admins can update employees" ON public.employees;
DROP POLICY IF EXISTS "Only admins can delete employees" ON public.employees;

-- Revoke all permissions from public and anon roles
REVOKE ALL ON public.employees FROM public;
REVOKE ALL ON public.employees FROM anon;

-- Create strict RLS policies

-- 1. SELECT: Only authenticated users with specific roles or own data
CREATE POLICY "Restrict employee data access"
ON public.employees
FOR SELECT
TO authenticated
USING (
  -- HR staff (admin, hr, manager) can see all employee data
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
  OR
  -- Regular employees can only see their own data
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 2. INSERT: Only HR staff can add employees
CREATE POLICY "Only HR staff can insert employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
);

-- 3. UPDATE: Only HR staff can update employees
CREATE POLICY "Only HR staff can update employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
);

-- 4. DELETE: Only admin can delete employees
CREATE POLICY "Only admin can delete employees"
ON public.employees
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Grant specific permissions only to authenticated users
GRANT SELECT ON public.employees TO authenticated;
GRANT INSERT ON public.employees TO authenticated;
GRANT UPDATE ON public.employees TO authenticated;
GRANT DELETE ON public.employees TO authenticated;