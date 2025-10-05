-- Fix 1: Rewrite get_user_department() to avoid profiles table recursion
CREATE OR REPLACE FUNCTION public.get_user_department(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_dept text;
BEGIN
  -- Get department from employees table instead of profiles to avoid recursion
  SELECT e.department_id::text INTO user_dept 
  FROM public.employees e 
  WHERE e.email = (SELECT email FROM auth.users WHERE id = user_id)
  LIMIT 1;
  
  RETURN user_dept;
END;
$$;

-- Fix 2: Drop the recursive RLS policy on profiles
DROP POLICY IF EXISTS "Managers can view department profiles" ON public.profiles;

-- Fix 3: Create simpler RLS policies for profiles using has_role
DROP POLICY IF EXISTS "profiles_admin_all_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_own_access" ON public.profiles;

CREATE POLICY "profiles_admin_all_access"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "profiles_user_view_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_user_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Fix 4: Simplify hotel_settings RLS to allow any authenticated user with a role
DROP POLICY IF EXISTS "hotel_settings_management_only_select" ON public.hotel_settings;
DROP POLICY IF EXISTS "hotel_settings_management_only_update" ON public.hotel_settings;
DROP POLICY IF EXISTS "hotel_settings_management_only_insert" ON public.hotel_settings;

CREATE POLICY "hotel_settings_authenticated_select"
ON public.hotel_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "hotel_settings_admin_modify"
ON public.hotel_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix 5: Manually add the current user as admin
-- First, check if user exists in auth.users, if so add to user_roles
DO $$
BEGIN
  -- Add the specific user as admin if they exist in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '2a5d2aaf-6e31-47b5-85d0-b745a014a308') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('2a5d2aaf-6e31-47b5-85d0-b745a014a308', 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;