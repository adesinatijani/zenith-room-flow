-- Fix the function by dropping and recreating it with the correct signature

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_employee_basic_info(text);

-- Recreate the function with the enhanced signature
CREATE OR REPLACE FUNCTION public.get_employee_basic_info(emp_email text DEFAULT NULL::text)
RETURNS TABLE(
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
  used_leave_days integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
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
    SELECT u.email INTO target_email FROM auth.users u WHERE u.id = auth.uid();
  ELSE
    target_email := emp_email;
  END IF;
  
  -- Check permissions
  IF current_user_role NOT IN ('admin', 'hr', 'manager') THEN
    -- Non-privileged users can only see their own info
    SELECT u.email INTO target_email FROM auth.users u WHERE u.id = auth.uid();
  END IF;
  
  -- Return basic info only (excluding sensitive fields like salary, bank_account, national_id, etc.)
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
    e.used_leave_days
  FROM public.employees e
  WHERE e.email = target_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_employee_basic_info(text) TO authenticated;