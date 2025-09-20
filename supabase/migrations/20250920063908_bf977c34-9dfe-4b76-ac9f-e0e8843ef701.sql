-- Fix Security Definer View warning by removing the potentially problematic view
-- and implementing a more secure access pattern

-- Drop the employee_self_view that's causing the security warning
DROP VIEW IF EXISTS public.employee_self_view CASCADE;

-- Instead of a view, we'll rely entirely on the RLS policies on the employees table
-- The existing RLS policies already provide the necessary security:
-- 1. "HR admins can view all employees" - for admin/HR access
-- 2. "Employees can view own basic info" - for employee self-access
-- 3. "Employees can view own data via view" - for self-service access

-- Create a secure function that returns employee self-service data
-- This is safer than a view because it explicitly controls what data is returned
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
  -- Admins/HR/managers should use the full employees table
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

-- Grant access to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.get_employee_self_data() TO authenticated;

-- Add comment explaining the security model
COMMENT ON FUNCTION public.get_employee_self_data() IS 
'Secure function for employee self-service data access. Returns limited employee data for the current user only. Excludes sensitive fields like salary, bank account, national ID, and address.';

-- Clean up the problematic RLS policy that was specifically for the view
DROP POLICY IF EXISTS "Employees can view own data via view" ON public.employees;

-- Ensure we still have the necessary policies for direct table access
-- (These should already exist from our previous migration, but let's make sure)

-- Verify the main employee access policies exist
DO $$
BEGIN
  -- Check if the main employee self-access policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'employees' 
    AND policyname = 'Employees can view own basic info'
  ) THEN
    -- Create the policy if it doesn't exist
    EXECUTE 'CREATE POLICY "Employees can view own basic info"
    ON public.employees
    FOR SELECT
    USING (
      -- Only if they are viewing their own record AND not an admin
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role NOT IN (''admin'', ''hr'', ''manager'')
      )
      AND 
      -- Match employee record to user profile via email
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )';
  END IF;
END
$$;

-- Create a safer alternative: A function that checks if the user can access employee data
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

GRANT EXECUTE ON FUNCTION public.can_access_employee_record(uuid) TO authenticated;

COMMENT ON FUNCTION public.can_access_employee_record(uuid) IS 
'Security function to check if current user can access a specific employee record based on role and ownership.';

-- Add a function to get safe employee data (excluding sensitive info for non-privileged users)
CREATE OR REPLACE FUNCTION public.get_safe_employee_data(emp_id uuid)
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
  -- Sensitive fields only for privileged users
  salary numeric,
  bank_account text,
  national_id text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
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
  current_user_role text;
  can_access_sensitive boolean;
BEGIN
  -- Check if user can access this employee record
  IF NOT public.can_access_employee_record(emp_id) THEN
    RAISE EXCEPTION 'Access denied to employee record';
  END IF;
  
  -- Get current user role
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Determine if user can see sensitive data
  can_access_sensitive := current_user_role IN ('admin', 'hr', 'manager');
  
  -- Return data based on privileges
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
    -- Sensitive fields - null for non-privileged users
    CASE WHEN can_access_sensitive THEN e.salary ELSE NULL END,
    CASE WHEN can_access_sensitive THEN e.bank_account ELSE NULL END,
    CASE WHEN can_access_sensitive THEN e.national_id ELSE NULL END,
    CASE WHEN can_access_sensitive THEN e.address ELSE NULL END,
    CASE WHEN can_access_sensitive THEN e.emergency_contact_name ELSE NULL END,
    CASE WHEN can_access_sensitive THEN e.emergency_contact_phone ELSE NULL END,
    e.total_leave_days,
    e.used_leave_days,
    e.created_at,
    e.updated_at
  FROM public.employees e
  WHERE e.id = emp_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_safe_employee_data(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_safe_employee_data(uuid) IS 
'Secure function to get employee data with automatic sensitive field filtering based on user role. Non-privileged users see basic info only.';

-- Clean up: Remove any remaining references to the old view
REVOKE ALL ON public.employee_self_view FROM authenticated;