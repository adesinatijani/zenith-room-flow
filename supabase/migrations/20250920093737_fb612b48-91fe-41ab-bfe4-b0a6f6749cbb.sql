-- Fix HR data security by implementing role-based RLS policies
-- This addresses the "Employee Performance and Leave Data Could Be Misused" security issue

-- Create function to check if user can access HR data
CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager');
END;
$$;

-- Function to check if user can access specific employee's data
CREATE OR REPLACE FUNCTION public.can_access_employee_data(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_email text;
  emp_email text;
BEGIN
  -- HR/Admin/Manager can access any employee data
  IF public.has_hr_access() THEN
    RETURN TRUE;
  END IF;
  
  -- Get current user's email
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Get employee's email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Employee can access their own data
  RETURN (current_user_email = emp_email);
END;
$$;

-- LEAVE_REQUESTS TABLE
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on leave_requests" ON public.leave_requests;

-- Create restrictive policies for leave_requests
CREATE POLICY "Users can view relevant leave requests" 
ON public.leave_requests 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "Employees can submit leave requests" 
ON public.leave_requests 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Employee can submit for themselves
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR
  -- HR/Manager can submit for others
  public.has_hr_access()
);

CREATE POLICY "Only HR can update leave requests" 
ON public.leave_requests 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "Only HR can delete leave requests" 
ON public.leave_requests 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- PERFORMANCE_REVIEWS TABLE
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on performance_reviews" ON public.performance_reviews;

-- Create restrictive policies for performance_reviews
CREATE POLICY "Users can view relevant performance reviews" 
ON public.performance_reviews 
FOR SELECT 
TO authenticated
USING (
  -- HR/Manager can see all reviews
  public.has_hr_access()
  OR
  -- Employee can see their own reviews
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR
  -- Reviewer can see reviews they created
  reviewer_id = auth.uid()
);

CREATE POLICY "Only HR and managers can create performance reviews" 
ON public.performance_reviews 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_hr_access());

CREATE POLICY "Only HR and reviewers can update performance reviews" 
ON public.performance_reviews 
FOR UPDATE 
TO authenticated
USING (
  public.has_hr_access() 
  OR 
  reviewer_id = auth.uid()
)
WITH CHECK (
  public.has_hr_access() 
  OR 
  reviewer_id = auth.uid()
);

CREATE POLICY "Only HR can delete performance reviews" 
ON public.performance_reviews 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- EMPLOYEE_LOANS TABLE (also sensitive HR data)
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on employee_loans" ON public.employee_loans;

-- Create restrictive policies for employee_loans
CREATE POLICY "Users can view relevant loan information" 
ON public.employee_loans 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "Employees can request loans" 
ON public.employee_loans 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Employee can request for themselves
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR
  -- HR can create for others
  public.has_hr_access()
);

CREATE POLICY "Only HR can manage loans" 
ON public.employee_loans 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "Only HR can delete loans" 
ON public.employee_loans 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- PAYROLL_RECORDS TABLE (highly sensitive financial HR data)
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on payroll_records" ON public.payroll_records;

-- Create restrictive policies for payroll_records
CREATE POLICY "Users can view relevant payroll records" 
ON public.payroll_records 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "Only HR can create payroll records" 
ON public.payroll_records 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_hr_access());

CREATE POLICY "Only HR can update payroll records" 
ON public.payroll_records 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "Only admins can delete payroll records" 
ON public.payroll_records 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');