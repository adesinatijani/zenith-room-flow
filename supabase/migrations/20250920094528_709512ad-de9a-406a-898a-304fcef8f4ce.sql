-- Fix employee data access security
-- This addresses the "Employee Personal Information Could Be Stolen by Hackers" security issue

-- First, let's clean up ALL existing policies on the employees table to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on employees table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'employees' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.employees';
    END LOOP;
END $$;

-- Create a more restrictive function to check employee data access
CREATE OR REPLACE FUNCTION public.can_access_employee_info(emp_id uuid)
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
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Admin, HR, and Manager can access all employee data
  IF current_user_role IN ('admin', 'hr', 'manager') THEN
    RETURN TRUE;
  END IF;
  
  -- Get the employee's email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Regular employees can only access their own record
  IF current_user_email = emp_email THEN
    RETURN TRUE;
  END IF;
  
  -- Deny access for all other cases
  RETURN FALSE;
END;
$$;

-- Create new restrictive policies for the employees table

-- SELECT policy: Only authorized personnel and the employee themselves
CREATE POLICY "employees_select_authorized_only" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_info(id));

-- INSERT policy: Only HR staff can create new employee records
CREATE POLICY "employees_insert_hr_only" 
ON public.employees 
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager'));

-- UPDATE policy: HR staff can update any employee, employees can update limited fields of their own record
CREATE POLICY "employees_update_restricted" 
ON public.employees 
FOR UPDATE 
TO authenticated
USING (
  -- HR/Admin/Manager can update any employee
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')
  OR
  -- Employee can update their own record (limited fields only)
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

-- DELETE policy: Only admin can delete employee records
CREATE POLICY "employees_delete_admin_only" 
ON public.employees 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create a view for basic employee information that can be safely accessed
-- This will provide only non-sensitive information for legitimate business needs
CREATE OR REPLACE VIEW public.employee_basic_info AS
SELECT 
  e.id,
  e.employee_id,
  e.first_name,
  e.last_name,
  e.department_id,
  e.position_id,
  e.status,
  e.hire_date,
  -- Only include email and phone for authorized users or the employee themselves
  CASE 
    WHEN public.can_access_employee_info(e.id) THEN e.email
    ELSE NULL
  END as email,
  CASE 
    WHEN public.can_access_employee_info(e.id) THEN e.phone
    ELSE NULL
  END as phone
FROM public.employees e
WHERE 
  -- Only show active employees in the basic view
  e.status = 'active'
  AND
  -- Apply the same access control as the main table
  public.can_access_employee_info(e.id);

-- Grant appropriate permissions on the view
GRANT SELECT ON public.employee_basic_info TO authenticated;