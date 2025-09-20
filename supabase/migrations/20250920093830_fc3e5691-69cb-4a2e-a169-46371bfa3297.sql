-- Fix HR data security by implementing role-based RLS policies (with proper cleanup)
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

-- LEAVE_REQUESTS TABLE - Clean up all existing policies first
DROP POLICY IF EXISTS "Allow all operations on leave_requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can view relevant leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Employees can submit leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Only HR can update leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Only HR can delete leave requests" ON public.leave_requests;

-- Create new restrictive policies for leave_requests
CREATE POLICY "HR_leave_view_policy" 
ON public.leave_requests 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "HR_leave_insert_policy" 
ON public.leave_requests 
FOR INSERT 
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR public.has_hr_access()
);

CREATE POLICY "HR_leave_update_policy" 
ON public.leave_requests 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "HR_leave_delete_policy" 
ON public.leave_requests 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- PERFORMANCE_REVIEWS TABLE - Clean up all existing policies first
DROP POLICY IF EXISTS "Allow all operations on performance_reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "Users can view relevant performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "Only HR and managers can create performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "Only HR and reviewers can update performance reviews" ON public.performance_reviews;
DROP POLICY IF EXISTS "Only HR can delete performance reviews" ON public.performance_reviews;

-- Create new restrictive policies for performance_reviews
CREATE POLICY "HR_review_view_policy" 
ON public.performance_reviews 
FOR SELECT 
TO authenticated
USING (
  public.has_hr_access()
  OR
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR
  reviewer_id = auth.uid()
);

CREATE POLICY "HR_review_insert_policy" 
ON public.performance_reviews 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_hr_access());

CREATE POLICY "HR_review_update_policy" 
ON public.performance_reviews 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access() OR reviewer_id = auth.uid())
WITH CHECK (public.has_hr_access() OR reviewer_id = auth.uid());

CREATE POLICY "HR_review_delete_policy" 
ON public.performance_reviews 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- EMPLOYEE_LOANS TABLE - Clean up all existing policies first
DROP POLICY IF EXISTS "Allow all operations on employee_loans" ON public.employee_loans;
DROP POLICY IF EXISTS "Users can view relevant loan information" ON public.employee_loans;
DROP POLICY IF EXISTS "Employees can request loans" ON public.employee_loans;
DROP POLICY IF EXISTS "Only HR can manage loans" ON public.employee_loans;
DROP POLICY IF EXISTS "Only HR can delete loans" ON public.employee_loans;

-- Create new restrictive policies for employee_loans
CREATE POLICY "HR_loan_view_policy" 
ON public.employee_loans 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "HR_loan_insert_policy" 
ON public.employee_loans 
FOR INSERT 
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR public.has_hr_access()
);

CREATE POLICY "HR_loan_update_policy" 
ON public.employee_loans 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "HR_loan_delete_policy" 
ON public.employee_loans 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- PAYROLL_RECORDS TABLE - Clean up all existing policies first
DROP POLICY IF EXISTS "Allow all operations on payroll_records" ON public.payroll_records;
DROP POLICY IF EXISTS "Users can view relevant payroll records" ON public.payroll_records;
DROP POLICY IF EXISTS "Only HR can create payroll records" ON public.payroll_records;
DROP POLICY IF EXISTS "Only HR can update payroll records" ON public.payroll_records;
DROP POLICY IF EXISTS "Only admins can delete payroll records" ON public.payroll_records;

-- Create new restrictive policies for payroll_records
CREATE POLICY "HR_payroll_view_policy" 
ON public.payroll_records 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "HR_payroll_insert_policy" 
ON public.payroll_records 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_hr_access());

CREATE POLICY "HR_payroll_update_policy" 
ON public.payroll_records 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "HR_payroll_delete_policy" 
ON public.payroll_records 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');