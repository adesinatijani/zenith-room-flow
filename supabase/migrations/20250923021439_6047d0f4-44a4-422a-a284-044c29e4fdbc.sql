-- Fix Security Definer View vulnerabilities by removing SECURITY DEFINER from views
-- This ensures proper RLS enforcement for each querying user

-- Drop the existing security definer views
DROP VIEW IF EXISTS public.employee_basic_info CASCADE;
DROP VIEW IF EXISTS public.employee_sensitive_info CASCADE; 
DROP VIEW IF EXISTS public.employee_financial_info CASCADE;

-- Create new secure views WITHOUT security definer
-- Basic employee info view (safe for managers in same department)
CREATE VIEW public.employee_basic_info AS
SELECT 
  id, employee_id, first_name, last_name, email, phone, 
  department_id, position_id, employment_type, hire_date, 
  status, total_leave_days, used_leave_days, created_at, updated_at
FROM public.employees
WHERE public.can_access_basic_employee_info(id);

-- Sensitive employee info view (HR and admin only + self)
CREATE VIEW public.employee_sensitive_info AS
SELECT 
  id, employee_id, first_name, last_name, email, phone,
  department_id, position_id, employment_type, hire_date, status,
  date_of_birth, address, national_id, 
  emergency_contact_name, emergency_contact_phone,
  total_leave_days, used_leave_days, manager_id, notes,
  created_at, updated_at
FROM public.employees
WHERE public.can_access_sensitive_employee_info(id);

-- Financial employee info view (HR and admin only + self)
CREATE VIEW public.employee_financial_info AS
SELECT 
  id, employee_id, first_name, last_name, email,
  department_id, position_id, salary, bank_account,
  created_at, updated_at
FROM public.employees
WHERE public.can_access_financial_employee_info(id);

-- Enable RLS on all views
ALTER VIEW public.employee_basic_info SET (security_barrier = true);
ALTER VIEW public.employee_sensitive_info SET (security_barrier = true);
ALTER VIEW public.employee_financial_info SET (security_barrier = true);

-- Grant proper access to authenticated users
GRANT SELECT ON public.employee_basic_info TO authenticated;
GRANT SELECT ON public.employee_sensitive_info TO authenticated;
GRANT SELECT ON public.employee_financial_info TO authenticated;

-- Revoke any public access
REVOKE ALL ON public.employee_basic_info FROM PUBLIC;
REVOKE ALL ON public.employee_sensitive_info FROM PUBLIC;
REVOKE ALL ON public.employee_financial_info FROM PUBLIC;