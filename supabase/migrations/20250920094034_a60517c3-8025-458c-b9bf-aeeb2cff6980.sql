-- Fix HR data security by implementing role-based RLS policies (final cleanup)
-- This addresses the "Employee Performance and Leave Data Could Be Misused" security issue

-- Create helper functions if they don't exist
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
  IF public.has_hr_access() THEN
    RETURN TRUE;
  END IF;
  
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  RETURN (current_user_email = emp_email);
END;
$$;

-- Clean up ALL policies on HR-related tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on leave_requests
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'leave_requests' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.leave_requests';
    END LOOP;
    
    -- Drop all policies on performance_reviews
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'performance_reviews' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.performance_reviews';
    END LOOP;
    
    -- Drop all policies on employee_loans
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'employee_loans' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.employee_loans';
    END LOOP;
    
    -- Drop all policies on payroll_records
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'payroll_records' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.payroll_records';
    END LOOP;
END $$;

-- LEAVE_REQUESTS - Create new secure policies
CREATE POLICY "secure_leave_select" 
ON public.leave_requests 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "secure_leave_insert" 
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

CREATE POLICY "secure_leave_update" 
ON public.leave_requests 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "secure_leave_delete" 
ON public.leave_requests 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- PERFORMANCE_REVIEWS - Create new secure policies
CREATE POLICY "secure_review_select" 
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

CREATE POLICY "secure_review_insert" 
ON public.performance_reviews 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_hr_access());

CREATE POLICY "secure_review_update" 
ON public.performance_reviews 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access() OR reviewer_id = auth.uid())
WITH CHECK (public.has_hr_access() OR reviewer_id = auth.uid());

CREATE POLICY "secure_review_delete" 
ON public.performance_reviews 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- EMPLOYEE_LOANS - Create new secure policies
CREATE POLICY "secure_loan_select" 
ON public.employee_loans 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "secure_loan_insert" 
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

CREATE POLICY "secure_loan_update" 
ON public.employee_loans 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "secure_loan_delete" 
ON public.employee_loans 
FOR DELETE 
TO authenticated
USING (public.has_hr_access());

-- PAYROLL_RECORDS - Create new secure policies
CREATE POLICY "secure_payroll_select" 
ON public.payroll_records 
FOR SELECT 
TO authenticated
USING (public.can_access_employee_data(employee_id));

CREATE POLICY "secure_payroll_insert" 
ON public.payroll_records 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_hr_access());

CREATE POLICY "secure_payroll_update" 
ON public.payroll_records 
FOR UPDATE 
TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "secure_payroll_delete" 
ON public.payroll_records 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');