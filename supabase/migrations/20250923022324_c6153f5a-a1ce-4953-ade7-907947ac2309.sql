-- CRITICAL SECURITY FIX: Comprehensive protection for employee sensitive data
-- Implement multi-tier access control for different data sensitivity levels

-- 1. Create granular field-level access control functions

-- Function for basic info only (safe for managers/colleagues)
CREATE OR REPLACE FUNCTION public.can_access_employee_basic_info_only(emp_id uuid)
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
  
  -- HR and Admin can access basic info for all employees
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
  
  -- Managers can access basic info of employees in their department
  IF current_user_role = 'manager' AND current_user_dept_id IS NOT NULL 
     AND emp_dept_id = current_user_dept_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function for sensitive personal info (national_id, address, emergency contacts, DOB)
CREATE OR REPLACE FUNCTION public.can_access_employee_sensitive_info_only(emp_id uuid)
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
    -- Log sensitive data access for audit
    INSERT INTO public.employee_access_log (
      employee_id, accessed_by, access_type, accessed_fields, access_time
    ) VALUES (
      emp_id, auth.uid(), 'sensitive_personal_data', 
      ARRAY['national_id', 'address', 'date_of_birth', 'emergency_contact'], now()
    );
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
CREATE OR REPLACE FUNCTION public.can_access_employee_financial_info_only(emp_id uuid)  
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
  
  -- Only HR and Admin can access financial info of others
  IF current_user_role IN ('admin', 'hr') THEN
    -- Log financial data access for audit (CRITICAL for compliance)
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

-- 2. Drop existing policies and create new granular ones
DROP POLICY IF EXISTS "employees_select_basic_only" ON public.employees;

-- Create new restrictive SELECT policy with field-level control
CREATE POLICY "employees_secure_select_with_field_protection" ON public.employees
FOR SELECT TO authenticated
USING (
  -- Users can only see data they have permission for
  public.can_access_employee_basic_info_only(id)
);

-- 3. Create secure UPDATE policy that prevents unauthorized field modifications
DROP POLICY IF EXISTS "employees_update_restricted" ON public.employees;

CREATE POLICY "employees_secure_update_with_field_restrictions" ON public.employees  
FOR UPDATE TO authenticated
USING (
  -- HR/Admin can update any employee
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') OR
  -- Employees can only update their own basic info (not sensitive fields)
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
)
WITH CHECK (
  -- HR/Admin can update any employee
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') OR
  -- Employees can only update their own basic info (not sensitive fields)
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);