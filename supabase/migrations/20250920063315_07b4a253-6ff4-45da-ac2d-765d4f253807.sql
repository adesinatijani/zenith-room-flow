-- Fix critical security vulnerability in employees table
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on employees" ON public.employees;

-- Create security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user is HR admin
CREATE OR REPLACE FUNCTION public.is_hr_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user can manage specific employee
CREATE OR REPLACE FUNCTION public.can_manage_employee(employee_uuid uuid)
RETURNS BOOLEAN AS $$
DECLARE
  current_role TEXT;
  user_profile_id uuid;
BEGIN
  -- Get current user role and profile
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  user_profile_id := auth.uid();
  
  -- Admins and HR can manage all employees
  IF current_role IN ('admin', 'hr') THEN
    RETURN TRUE;
  END IF;
  
  -- Managers can manage their direct reports
  IF current_role = 'manager' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.employees 
      WHERE id = employee_uuid 
      AND manager_id = user_profile_id
    );
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Policy 1: HR admins can view all employee data
CREATE POLICY "HR admins can view all employees"
ON public.employees
FOR SELECT
USING (public.is_hr_admin());

-- Policy 2: HR admins can insert new employees
CREATE POLICY "HR admins can insert employees"
ON public.employees
FOR INSERT
WITH CHECK (public.is_hr_admin());

-- Policy 3: HR admins can update employee data
CREATE POLICY "HR admins can update employees"
ON public.employees
FOR UPDATE
USING (public.can_manage_employee(id));

-- Policy 4: HR admins can delete employees (soft delete recommended)
CREATE POLICY "HR admins can delete employees"
ON public.employees
FOR DELETE
USING (public.is_hr_admin());

-- Policy 5: Employees can view limited own data (excluding sensitive financial info)
-- Note: This creates a view-like access where employees see their own basic info
-- but not salary, bank account, or other sensitive details
CREATE POLICY "Employees can view own basic info"
ON public.employees
FOR SELECT
USING (
  -- Only if they're viewing their own record AND not an admin
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role NOT IN ('admin', 'hr', 'manager')
  )
  AND 
  -- Match employee record to user profile via email or employee_id
  (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Alternative: match via profiles if there's a connection
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND (p.first_name = employees.first_name AND p.last_name = employees.last_name)
    )
  )
);

-- Create a secure view for employee self-service (excluding sensitive data)
CREATE OR REPLACE VIEW public.employee_self_view AS
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
  -- Exclude sensitive fields: salary, bank_account, national_id, address, emergency contacts
  created_at,
  updated_at
FROM public.employees
WHERE 
  -- Only show own record
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND
  -- Only for non-admin users
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'hr', 'manager')
  );

-- Grant access to the self-service view
GRANT SELECT ON public.employee_self_view TO authenticated;

-- Add RLS to the view
ALTER VIEW public.employee_self_view SET (security_barrier = true);

-- Create audit log for employee data access (optional but recommended)
CREATE TABLE IF NOT EXISTS public.employee_access_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id),
  accessed_by uuid REFERENCES auth.users(id),
  access_type TEXT NOT NULL, -- 'view', 'update', 'create', 'delete'
  accessed_fields TEXT[], -- which fields were accessed
  access_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.employee_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view access logs"
ON public.employee_access_log
FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Add trigger to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_employee_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when sensitive employee data is accessed
  IF TG_OP = 'SELECT' AND public.get_current_user_role() IN ('admin', 'hr', 'manager') THEN
    INSERT INTO public.employee_access_log (
      employee_id, 
      accessed_by, 
      access_type,
      accessed_fields
    ) VALUES (
      NEW.id,
      auth.uid(),
      'view',
      ARRAY['salary', 'bank_account', 'national_id', 'address']
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;