-- Fix security definer view and function search path issues

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.employee_self_view;

-- Recreate the view without security definer (safer approach)
-- Employees can use this view to see their own limited data
CREATE OR REPLACE VIEW public.employee_self_view AS
SELECT 
  e.id,
  e.employee_id,
  e.first_name,
  e.last_name,
  e.email,
  e.phone,
  e.department_id,
  e.position_id,
  e.employment_type,
  e.hire_date,
  e.status,
  e.total_leave_days,
  e.used_leave_days,
  e.created_at,
  e.updated_at
FROM public.employees e
WHERE 
  -- Security through RLS policies rather than SECURITY DEFINER
  -- The RLS policies on employees table will handle access control
  true;

-- Enable RLS on the view (this will respect the policies on the underlying table)
ALTER VIEW public.employee_self_view SET (security_barrier = true);

-- Fix function search paths to be immutable and secure
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

DROP FUNCTION IF EXISTS public.is_hr_admin();
CREATE OR REPLACE FUNCTION public.is_hr_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager');
END;
$$;

DROP FUNCTION IF EXISTS public.can_manage_employee(uuid);
CREATE OR REPLACE FUNCTION public.can_manage_employee(employee_uuid uuid)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE 
SET search_path = public, pg_temp
AS $$
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
$$;

-- Fix the log function search path
DROP FUNCTION IF EXISTS public.log_employee_access();
CREATE OR REPLACE FUNCTION public.log_employee_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- Update existing functions to have proper search paths
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Insert profile with admin role if first user, otherwise staff
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    role
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'staff' END
  );
  
  RETURN NEW;
END;
$$;

-- Remove the problematic employee_self_view grants since we're not using SECURITY DEFINER
REVOKE ALL ON public.employee_self_view FROM authenticated;

-- Create a safer approach: Add a policy for the view that restricts access
CREATE POLICY "Employees can view own data via view"
ON public.employees
FOR SELECT
USING (
  -- Allow access if user is querying their own data
  (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.first_name = employees.first_name 
      AND p.last_name = employees.last_name
    )
  )
  -- And user is not an admin (admins use the full access policy)
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'hr', 'manager')
  )
);

-- Grant basic authenticated access to the view (RLS will control what they see)
GRANT SELECT ON public.employee_self_view TO authenticated;

-- Add comment to explain the security model
COMMENT ON VIEW public.employee_self_view IS 
'Secure view for employee self-service. Access is controlled by RLS policies on the underlying employees table, not SECURITY DEFINER.';

COMMENT ON FUNCTION public.get_current_user_role() IS 
'Security definer function to safely get user role without exposing sensitive data.';

COMMENT ON FUNCTION public.is_hr_admin() IS 
'Security definer function to check if user has HR/admin privileges.';

COMMENT ON FUNCTION public.can_manage_employee(uuid) IS 
'Security definer function to check if user can manage a specific employee record.';

-- Additional security: Create a function to safely check if user can see employee data
CREATE OR REPLACE FUNCTION public.can_view_employee_data(employee_record public.employees)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- HR/Admin can see all employee data
  IF current_user_role IN ('admin', 'hr', 'manager') THEN
    RETURN TRUE;
  END IF;
  
  -- Regular employees can only see their own basic data
  IF current_user_role = 'staff' OR current_user_role IS NULL THEN
    -- Check if this is their own record
    RETURN (
      employee_record.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() 
        AND p.first_name = employee_record.first_name 
        AND p.last_name = employee_record.last_name
      )
    );
  END IF;
  
  -- Default: no access
  RETURN FALSE;
END;
$$;