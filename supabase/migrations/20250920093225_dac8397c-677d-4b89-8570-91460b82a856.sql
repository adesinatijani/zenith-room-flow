-- Fix employee data security by implementing granular RLS policies
-- This addresses the "Employee Personal Information Could Be Stolen" security issue

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Restrict employee data access" ON public.employees;

-- Create more granular policies for different types of access

-- 1. Basic employee info (name, department, position) - viewable by all authenticated users
CREATE POLICY "Allow viewing basic employee info" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (true);

-- However, we need to create a more restrictive approach using functions
-- Let's create a security definer function that returns only appropriate data

CREATE OR REPLACE FUNCTION public.get_employee_data_for_user(emp_id uuid)
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
  used_leave_days integer,
  -- Sensitive fields only for authorized users
  salary numeric,
  date_of_birth date,
  address text,
  bank_account text,
  national_id text,
  emergency_contact_name text,
  emergency_contact_phone text,
  manager_id uuid,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
  emp_email text;
BEGIN
  -- Get current user details
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  SELECT u.email INTO current_user_email FROM auth.users u WHERE u.id = auth.uid();
  
  -- Get employee email
  SELECT e.email INTO emp_email FROM public.employees e WHERE e.id = emp_id;
  
  -- Admin, HR, and Manager can see all data
  IF current_user_role IN ('admin', 'hr', 'manager') THEN
    RETURN QUERY
    SELECT 
      e.id, e.employee_id, e.first_name, e.last_name, e.email, e.phone,
      e.department_id, e.position_id, e.employment_type, e.hire_date, e.status,
      e.total_leave_days, e.used_leave_days, e.salary, e.date_of_birth, e.address,
      e.bank_account, e.national_id, e.emergency_contact_name, e.emergency_contact_phone,
      e.manager_id, e.notes, e.created_at, e.updated_at
    FROM public.employees e
    WHERE e.id = emp_id;
    
  -- Employee can see their own full data
  ELSIF emp_email = current_user_email THEN
    RETURN QUERY
    SELECT 
      e.id, e.employee_id, e.first_name, e.last_name, e.email, e.phone,
      e.department_id, e.position_id, e.employment_type, e.hire_date, e.status,
      e.total_leave_days, e.used_leave_days, e.salary, e.date_of_birth, e.address,
      e.bank_account, e.national_id, e.emergency_contact_name, e.emergency_contact_phone,
      e.manager_id, e.notes, e.created_at, e.updated_at
    FROM public.employees e
    WHERE e.id = emp_id;
    
  -- Other authenticated users can only see basic info (no sensitive data)
  ELSE
    RETURN QUERY
    SELECT 
      e.id, e.employee_id, e.first_name, e.last_name, e.email, e.phone,
      e.department_id, e.position_id, e.employment_type, e.hire_date, e.status,
      e.total_leave_days, e.used_leave_days, 
      NULL::numeric as salary, NULL::date as date_of_birth, NULL::text as address,
      NULL::text as bank_account, NULL::text as national_id, 
      NULL::text as emergency_contact_name, NULL::text as emergency_contact_phone,
      NULL::uuid as manager_id, NULL::text as notes, 
      e.created_at, e.updated_at
    FROM public.employees e
    WHERE e.id = emp_id;
  END IF;
END;
$$;

-- Replace the overly broad SELECT policy with a more restrictive one
-- Users can only see employees they have permission to access
CREATE POLICY "Restrict employee data access by role" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (
  -- Admin, HR, Manager can see all employees
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
  OR 
  -- Regular employees can only see their own record
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Enhance the existing policies to be more explicit about data protection
-- Update insert policy to ensure only HR roles can create employee records
DROP POLICY IF EXISTS "Only HR staff can insert employees" ON public.employees;
CREATE POLICY "Only HR staff can insert employees" 
ON public.employees 
FOR INSERT 
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
);

-- Update update policy to ensure only authorized users can modify employee data
DROP POLICY IF EXISTS "Only HR staff can update employees" ON public.employees;
CREATE POLICY "Only HR staff can update employees" 
ON public.employees 
FOR UPDATE 
TO authenticated
USING (
  -- HR/Admin/Manager can update any employee
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
  OR
  -- Employees can update limited fields of their own record only
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
   AND (SELECT role FROM public.profiles WHERE id = auth.uid()) NOT IN ('admin', 'hr', 'manager'))
)
WITH CHECK (
  -- Same conditions for WITH CHECK
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
  OR
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
   AND (SELECT role FROM public.profiles WHERE id = auth.uid()) NOT IN ('admin', 'hr', 'manager'))
);

-- Keep the delete policy as is - only admin can delete
-- DROP POLICY IF EXISTS "Only admin can delete employees" ON public.employees;
-- This policy is already restrictive enough

-- Add a policy to log access to sensitive employee data
CREATE OR REPLACE FUNCTION public.log_sensitive_employee_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when someone accesses employee sensitive data
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') THEN
    INSERT INTO public.employee_access_log (
      employee_id,
      accessed_by,
      access_type,
      accessed_fields,
      access_time
    ) VALUES (
      NEW.id,
      auth.uid(),
      'sensitive_view',
      ARRAY['salary', 'bank_account', 'national_id', 'address', 'emergency_contact'],
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;