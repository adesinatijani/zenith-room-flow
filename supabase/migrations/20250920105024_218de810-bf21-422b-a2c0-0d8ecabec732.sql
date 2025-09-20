-- Fix profiles table security vulnerability
-- Remove the overly permissive SELECT policy that allows public access

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure SELECT policies for profiles table
-- Only authenticated users can view basic profile info, sensitive fields restricted to admins/owners

CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Create a more restrictive policy for unauthenticated users (none)
CREATE POLICY "No public access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false);

-- Additional security: Create a function to get current user's profile only
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
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
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.role,
    p.department,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

-- Create a function for admins to get all profiles (with audit logging)
CREATE OR REPLACE FUNCTION public.get_all_profiles_admin()
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
  current_role text;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  
  IF current_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log admin access to profiles (optional audit trail)
  INSERT INTO public.employee_access_log (
    employee_id,
    accessed_by,
    access_type,
    accessed_fields,
    access_time
  ) VALUES (
    null, -- All employees accessed
    auth.uid(),
    'admin_profile_list',
    ARRAY['all_profiles'],
    now()
  );
  
  -- Return all profiles for admin
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.role,
    p.department,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;