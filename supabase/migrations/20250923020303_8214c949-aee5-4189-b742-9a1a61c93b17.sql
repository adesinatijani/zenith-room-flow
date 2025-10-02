-- Fix the overly permissive profile access policy
-- Remove the policy that allows all authenticated users to view all profiles

DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Create proper granular access policies for profiles

-- 1. Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- 2. Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. HR personnel can view all profiles
CREATE POLICY "HR can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

-- 4. Managers can view profiles in their department (if department structure exists)
CREATE POLICY "Managers can view department profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p1
    WHERE p1.id = auth.uid() 
    AND p1.role = 'manager'
    AND (
      p1.department IS NULL OR -- If no department restriction
      public.profiles.department = p1.department -- Same department
    )
  )
);

-- Create a secure function to get visible profiles based on user permissions
CREATE OR REPLACE FUNCTION public.get_accessible_profiles()
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  phone text,
  role text,
  department text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_dept text;
BEGIN
  -- Get current user's role and department
  SELECT p.role, p.department 
  INTO current_user_role, current_user_dept
  FROM public.profiles p 
  WHERE p.id = auth.uid();
  
  -- Return profiles based on user's role and permissions
  IF current_user_role = 'admin' OR current_user_role = 'hr' THEN
    -- Admin and HR can see all profiles
    RETURN QUERY
    SELECT 
      p.id, p.first_name, p.last_name, p.phone, p.role, 
      p.department, p.is_active, p.created_at, p.updated_at
    FROM public.profiles p
    ORDER BY p.last_name, p.first_name;
    
  ELSIF current_user_role = 'manager' THEN
    -- Managers can see profiles in their department + their own
    RETURN QUERY
    SELECT 
      p.id, p.first_name, p.last_name, p.phone, p.role, 
      p.department, p.is_active, p.created_at, p.updated_at
    FROM public.profiles p
    WHERE p.department = current_user_dept OR p.id = auth.uid()
    ORDER BY p.last_name, p.first_name;
    
  ELSE
    -- Regular users can only see their own profile
    RETURN QUERY
    SELECT 
      p.id, p.first_name, p.last_name, p.phone, p.role, 
      p.department, p.is_active, p.created_at, p.updated_at
    FROM public.profiles p
    WHERE p.id = auth.uid();
  END IF;
END;
$$;

-- Update the admin function to use proper security checks
DROP FUNCTION IF EXISTS public.get_all_profiles_admin();

-- Create audit logging for profile access
CREATE OR REPLACE FUNCTION public.log_profile_access(accessed_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Only log if accessing someone else's profile
  IF accessed_profile_id != auth.uid() THEN
    INSERT INTO public.employee_access_log (
      employee_id,
      accessed_by,
      access_type,
      accessed_fields,
      access_time
    ) VALUES (
      accessed_profile_id,
      auth.uid(),
      'profile_view',
      ARRAY['profile_data'],
      now()
    );
  END IF;
END;
$$;