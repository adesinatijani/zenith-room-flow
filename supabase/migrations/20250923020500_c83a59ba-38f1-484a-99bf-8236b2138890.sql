-- Fix critical employee data security vulnerability
-- Create granular access controls for different types of employee data

-- First, let's update the main access function to be more restrictive
DROP FUNCTION IF EXISTS public.can_access_employee_info(uuid);

-- Create separate functions for different data sensitivity levels

-- Function for basic employee info access (name, email, phone, department, position)
CREATE OR REPLACE FUNCTION public.can_access_basic_employee_info(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
  current_user_dept_id uuid;
  emp_email text;
  emp_dept_id uuid;
BEGIN
  -- Get current user's role, email, and department
  SELECT p.role, u.email, e.department_id 
  INTO current_user_role, current_user_email, current_user_dept_id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.employees e ON e.email = u.email
  WHERE p.id = auth.uid();
  
  -- Admin and HR can access all basic employee data
  IF current_user_role IN ('admin', 'hr') THEN
    RETURN TRUE;
  END IF;
  
  -- Get employee's email and department
  SELECT email, department_id INTO emp_email, emp_dept_id 
  FROM public.employees WHERE id = emp_id;
  
  -- Employees can access their own basic data
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  -- Managers can only access basic data of employees in their department
  IF current_user_role = 'manager' AND current_user_dept_id IS NOT NULL 
     AND emp_dept_id = current_user_dept_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function for sensitive personal info (national_id, address, emergency contacts, date_of_birth)
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
  
  -- Only Admin and HR can access sensitive personal info of others
  IF current_user_role IN ('admin', 'hr') THEN
    RETURN TRUE;
  END IF;
  
  -- Get employee's email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Employees can access their own sensitive data
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function for financial info (salary, bank_account)
CREATE OR REPLACE FUNCTION public.can_access_financial_employee_info(emp_id uuid)
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
  
  -- Only Admin and HR can access financial info of others
  IF current_user_role IN ('admin', 'hr') THEN
    -- Log access to financial data
    INSERT INTO public.employee_access_log (
      employee_id, accessed_by, access_type, accessed_fields, access_time
    ) VALUES (
      emp_id, auth.uid(), 'financial_data_access', 
      ARRAY['salary', 'bank_account'], now()
    );
    RETURN TRUE;
  END IF;
  
  -- Get employee's email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Employees can access their own financial data
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create secure views for different access levels

-- Basic employee info view (safe for managers in same department)
CREATE OR REPLACE VIEW public.employee_basic_info AS
SELECT 
  id, employee_id, first_name, last_name, email, phone, 
  department_id, position_id, employment_type, hire_date, 
  status, total_leave_days, used_leave_days, created_at, updated_at
FROM public.employees
WHERE public.can_access_basic_employee_info(id);

-- Sensitive employee info view (HR and admin only + self)
CREATE OR REPLACE VIEW public.employee_sensitive_info AS
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
CREATE OR REPLACE VIEW public.employee_financial_info AS
SELECT 
  id, employee_id, first_name, last_name, email,
  department_id, position_id, salary, bank_account,
  created_at, updated_at
FROM public.employees
WHERE public.can_access_financial_employee_info(id);

-- Update the main employees table RLS policies
DROP POLICY IF EXISTS "employees_select_authorized_only" ON public.employees;

-- Create more restrictive SELECT policy
CREATE POLICY "employees_select_basic_only" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (public.can_access_basic_employee_info(id));

-- Grant access to the secure views
GRANT SELECT ON public.employee_basic_info TO authenticated;
GRANT SELECT ON public.employee_sensitive_info TO authenticated;
GRANT SELECT ON public.employee_financial_info TO authenticated;

-- Create audit function for manager access to employee data
CREATE OR REPLACE FUNCTION public.audit_manager_employee_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
BEGIN
  -- Get current user info
  SELECT p.role, u.email 
  INTO current_user_role, current_user_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
  
  -- Log manager access to employee data (not self)
  IF current_user_role = 'manager' AND NEW.email != current_user_email THEN
    INSERT INTO public.employee_access_log (
      employee_id, accessed_by, access_type, accessed_fields, access_time
    ) VALUES (
      NEW.id, auth.uid(), 'manager_basic_access', 
      ARRAY['basic_info'], now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging (only for SELECT operations through views)
-- Note: Triggers on SELECT don't exist, so we'll rely on the function-based logging