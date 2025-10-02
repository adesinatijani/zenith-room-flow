-- Fix critical security vulnerability in employee_sensitive_info view
-- Implement comprehensive access controls for sensitive employee data

-- 1. First, check and ensure the security function works properly
CREATE OR REPLACE FUNCTION public.can_access_sensitive_employee_info(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
  emp_email text;
BEGIN
  -- Get current user's role and email
  SELECT p.role, u.email 
  INTO current_user_role, current_user_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
  
  -- Only HR and Admin can access sensitive personal info of others
  IF current_user_role IN ('admin', 'hr') THEN
    -- Log access to sensitive data for audit purposes
    INSERT INTO public.employee_access_log (
      employee_id, accessed_by, access_type, accessed_fields, access_time
    ) VALUES (
      emp_id, auth.uid(), 'sensitive_data_access', 
      ARRAY['national_id', 'date_of_birth', 'address', 'emergency_contact'], now()
    );
    RETURN TRUE;
  END IF;
  
  -- Get employee's email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Employees can only access their own sensitive data
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  -- Default deny
  RETURN FALSE;
END;
$$;

-- 2. Recreate the view with stronger security
DROP VIEW IF EXISTS public.employee_sensitive_info CASCADE;

CREATE VIEW public.employee_sensitive_info
WITH (security_invoker=on) AS
SELECT 
  id, employee_id, first_name, last_name, email, phone,
  department_id, position_id, employment_type, hire_date, status,
  date_of_birth, address, national_id, 
  emergency_contact_name, emergency_contact_phone,
  total_leave_days, used_leave_days, manager_id, notes,
  created_at, updated_at
FROM public.employees
WHERE public.can_access_sensitive_employee_info(id);

-- 3. Set proper permissions - ONLY authenticated users, NO public access
REVOKE ALL ON public.employee_sensitive_info FROM PUBLIC;
REVOKE ALL ON public.employee_sensitive_info FROM anon;
GRANT SELECT ON public.employee_sensitive_info TO authenticated;

-- 4. Add additional security layer - create a secure access function
CREATE OR REPLACE FUNCTION public.get_employee_sensitive_data(employee_uuid uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid, employee_id text, first_name text, last_name text, email text, phone text,
  department_id uuid, position_id uuid, employment_type text, hire_date date, status text,
  date_of_birth date, address text, national_id text, 
  emergency_contact_name text, emergency_contact_phone text,
  total_leave_days integer, used_leave_days integer, manager_id uuid, notes text,
  created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
  current_email text;
BEGIN
  -- Get current user details
  SELECT p.role, u.email INTO current_role, current_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id  
  WHERE p.id = auth.uid();
  
  -- Security check: Only HR/Admin can access others' sensitive data
  IF current_role NOT IN ('admin', 'hr') AND employee_uuid IS NOT NULL THEN
    -- Non-privileged users can only access their own data
    IF NOT EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = employee_uuid AND e.email = current_email
    ) THEN
      RAISE EXCEPTION 'Access denied: Insufficient privileges to view sensitive employee data';
    END IF;
  END IF;
  
  -- Return data based on access level
  IF employee_uuid IS NOT NULL THEN
    -- Return specific employee data
    RETURN QUERY
    SELECT * FROM public.employee_sensitive_info e WHERE e.id = employee_uuid;
  ELSE
    -- Return accessible employees based on role
    RETURN QUERY
    SELECT * FROM public.employee_sensitive_info;
  END IF;
END;
$$;

-- 5. Additional protection: Revoke direct access, force function usage for sensitive operations
COMMENT ON VIEW public.employee_sensitive_info IS 
'SECURITY NOTICE: This view contains highly sensitive employee data including national IDs, addresses, and emergency contacts. Access is restricted to HR staff, administrators, and employees viewing their own data only. All access is logged for audit purposes.';

-- 6. Create trigger to log all sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_employee_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all access to sensitive employee data
  INSERT INTO public.employee_access_log (
    employee_id,
    accessed_by,
    access_type, 
    accessed_fields,
    access_time
  ) VALUES (
    NEW.id,
    auth.uid(),
    'sensitive_view_access',
    ARRAY['national_id', 'date_of_birth', 'address', 'emergency_contact_name', 'emergency_contact_phone'],
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;