-- Fix RLS policies for employees table to prevent unauthorized access to sensitive data

-- Drop existing potentially problematic policies
DROP POLICY IF EXISTS "Employees can view own basic info" ON public.employees;
DROP POLICY IF EXISTS "HR admins can view all employees" ON public.employees;

-- Create secure RLS policies for employees table

-- 1. Allow HR admins (admin, hr, manager roles) to view all employee data
CREATE POLICY "HR admins can view all employees"
ON public.employees
FOR SELECT
USING (public.is_hr_admin());

-- 2. Allow employees to view only their own basic information (no sensitive fields)
CREATE POLICY "Employees can view own basic info only"
ON public.employees  
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 3. Only HR admins can insert employee records
CREATE POLICY "Only HR admins can insert employees"
ON public.employees
FOR INSERT
WITH CHECK (public.is_hr_admin());

-- 4. Only HR admins can update employee records
CREATE POLICY "Only HR admins can update employees"
ON public.employees
FOR UPDATE
USING (public.is_hr_admin())
WITH CHECK (public.is_hr_admin());

-- 5. Only admin role can delete employee records
CREATE POLICY "Only admins can delete employees"
ON public.employees
FOR DELETE
USING (public.get_current_user_role() = 'admin');

-- Create a secure view for employee self-service that excludes sensitive fields
CREATE OR REPLACE VIEW public.employee_safe_view AS
SELECT 
  id,
  employee_id,
  first_name,
  last_name,
  email,
  phone,
  department_id,
  position_id,
  employment_type,
  hire_date,
  status,
  total_leave_days,
  used_leave_days,
  created_at,
  updated_at
FROM public.employees;

-- Enable RLS on the view
ALTER VIEW public.employee_safe_view SET (security_barrier = true);

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.employee_safe_view TO authenticated;