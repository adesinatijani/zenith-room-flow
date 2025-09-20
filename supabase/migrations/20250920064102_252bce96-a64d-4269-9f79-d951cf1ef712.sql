-- Properly fix the Security Definer View issue by removing the view
-- and implementing secure function-based access

-- Drop the employee_self_view that's causing the security warning
DROP VIEW IF EXISTS public.employee_self_view CASCADE;

-- Create secure functions for employee data access instead of using views
-- This approach is more secure and doesn't trigger the linter warning

-- Function 1: Get employee self-service data (limited fields, own record only)
CREATE OR REPLACE FUNCTION public.get_employee_self_data()
RETURNS TABLE (
  id uuid,
  employee_id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  department_id uuid,
  position_id uuid,
  employment_type text,
  hire_date date,
  status text,
  total_leave_days integer,
  used_leave_days integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_email text;
  current_user_role text;
BEGIN
  -- Get current user's email and role
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Only allow staff members to access their own data (not admins/HR/managers)
  -- Admins/HR/managers should use the full employees table with RLS
  IF current_user_role IN ('admin', 'hr', 'manager') THEN
    RAISE EXCEPTION 'Use direct employees table access for administrative roles';
  END IF;
  
  -- Return limited employee data for the current user only
  RETURN QUERY
  SELECT 
    e.id,
    e.employee_id,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    e.department_id,
    e.position_id,
    e.employment_type,
    e.hire_date,
    e.status,
    e.total_leave_days,
    e.used_leave_days,
    e.created_at,
    e.updated_at
  FROM public.employees e
  WHERE e.email = current_user_email;
END;
$$;

-- Function 2: Check if user can access specific employee record
CREATE OR REPLACE FUNCTION public.can_access_employee_record(emp_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
  emp_email text;
BEGIN
  -- Get current user details
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Get employee email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Admin/HR/Manager can access any employee record
  IF current_user_role IN ('admin', 'hr', 'manager') THEN
    RETURN TRUE;
  END IF;
  
  -- Regular employees can only access their own record
  RETURN (emp_email = current_user_email);
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_employee_self_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_employee_record(uuid) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.get_employee_self_data() IS 
'Secure function for employee self-service data access. Returns limited employee data for the current user only. Excludes sensitive fields like salary, bank account, national ID, and address. Replaces the problematic employee_self_view.';

COMMENT ON FUNCTION public.can_access_employee_record(uuid) IS 
'Security function to check if current user can access a specific employee record based on role and ownership.';

-- Clean up any remaining policies that referenced the old view
DROP POLICY IF EXISTS "Employees can view own data via view" ON public.employees;

-- Ensure the core RLS policies are in place for direct table access
-- These policies handle access when admins/HR query the employees table directly

-- Verify all necessary policies exist (they should from previous migrations)
DO $$
BEGIN
  -- Ensure HR admin view policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'employees' 
    AND policyname = 'HR admins can view all employees'
  ) THEN
    CREATE POLICY "HR admins can view all employees"
    ON public.employees
    FOR SELECT
    USING (public.is_hr_admin());
  END IF;
  
  -- Ensure employee self-access policy exists  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'employees' 
    AND policyname = 'Employees can view own basic info'
  ) THEN
    CREATE POLICY "Employees can view own basic info"
    ON public.employees
    FOR SELECT
    USING (
      -- Only if they are viewing their own record AND not an admin
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role NOT IN ('admin', 'hr', 'manager')
      )
      AND 
      -- Match employee record to user profile via email
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );
  END IF;
END
$$;

-- Create a helper function to safely get employee basic info (for UI components)
CREATE OR REPLACE FUNCTION public.get_employee_basic_info(emp_email text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  employee_id text,
  first_name text,
  last_name text,
  email text,
  department_id uuid,
  position_id uuid,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  target_email text;
  current_user_role text;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Determine target email
  IF emp_email IS NULL THEN
    -- Default to current user's email
    SELECT email INTO target_email FROM auth.users WHERE id = auth.uid();
  ELSE
    target_email := emp_email;
  END IF;
  
  -- Check permissions
  IF current_user_role NOT IN ('admin', 'hr', 'manager') THEN
    -- Non-privileged users can only see their own info
    SELECT email INTO target_email FROM auth.users WHERE id = auth.uid();
  END IF;
  
  -- Return basic info only
  RETURN QUERY
  SELECT 
    e.id,
    e.employee_id,
    e.first_name,
    e.last_name,
    e.email,
    e.department_id,
    e.position_id,
    e.status
  FROM public.employees e
  WHERE e.email = target_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_employee_basic_info(text) TO authenticated;

COMMENT ON FUNCTION public.get_employee_basic_info(text) IS 
'Helper function to safely get basic employee information. Non-privileged users can only access their own data.';