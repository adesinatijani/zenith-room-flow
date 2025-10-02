-- Fix all remaining security vulnerabilities

-- 1. Fix Security Definer Views by recreating with security_invoker=on
DROP VIEW IF EXISTS public.employee_basic_info CASCADE;
DROP VIEW IF EXISTS public.employee_sensitive_info CASCADE; 
DROP VIEW IF EXISTS public.employee_financial_info CASCADE;

-- Create secure views WITH security_invoker=on to respect RLS
CREATE VIEW public.employee_basic_info
WITH (security_invoker=on) AS
SELECT 
  id, employee_id, first_name, last_name, email, phone, 
  department_id, position_id, employment_type, hire_date, 
  status, total_leave_days, used_leave_days, created_at, updated_at
FROM public.employees
WHERE public.can_access_basic_employee_info(id);

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

CREATE VIEW public.employee_financial_info
WITH (security_invoker=on) AS
SELECT 
  id, employee_id, first_name, last_name, email,
  department_id, position_id, salary, bank_account,
  created_at, updated_at
FROM public.employees
WHERE public.can_access_financial_employee_info(id);

-- Grant proper access to authenticated users only
GRANT SELECT ON public.employee_basic_info TO authenticated;
GRANT SELECT ON public.employee_sensitive_info TO authenticated;
GRANT SELECT ON public.employee_financial_info TO authenticated;

-- Ensure no public access
REVOKE ALL ON public.employee_basic_info FROM PUBLIC;
REVOKE ALL ON public.employee_sensitive_info FROM PUBLIC;
REVOKE ALL ON public.employee_financial_info FROM PUBLIC;

-- 2. Enhance password security by adding strong password validation
CREATE OR REPLACE FUNCTION public.validate_strong_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Minimum 12 characters
  IF length(password) < 12 THEN
    RETURN false;
  END IF;
  
  -- At least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;  
  END IF;
  
  -- At least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- At least one digit
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- At least one special character
  IF password !~ '[^A-Za-z0-9]' THEN
    RETURN false;
  END IF;
  
  -- No common weak passwords
  IF password ILIKE ANY(ARRAY[
    'password123', '123456789', 'qwerty123', 'admin123', 
    'welcome123', 'password1234', 'letmein123'
  ]) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;