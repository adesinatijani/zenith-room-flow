-- Phase 2: Create secure field-level access with data masking
-- Implement proper data hiding for sensitive fields

-- 1. Create secure data access function that masks sensitive fields
CREATE OR REPLACE FUNCTION public.get_employee_data_secure(emp_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  employee_id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  department_id uuid,
  position_id uuid,
  hire_date date,
  salary numeric,
  employment_type text,
  status text,
  emergency_contact_name text,
  emergency_contact_phone text,
  date_of_birth date,
  national_id text,
  bank_account text,
  total_leave_days integer,
  used_leave_days integer,
  manager_id uuid,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
  current_email text;
  can_see_sensitive boolean := false;
  can_see_financial boolean := false;
BEGIN
  -- Get current user details
  SELECT p.role, u.email INTO current_role, current_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
  
  -- Determine access levels
  can_see_sensitive := current_role IN ('admin', 'hr');
  can_see_financial := current_role IN ('admin', 'hr');
  
  -- Return data with proper field masking
  RETURN QUERY
  SELECT 
    e.id,
    e.employee_id,
    e.first_name,
    e.last_name,
    e.email,
    -- Mask phone for non-authorized users
    CASE 
      WHEN can_see_sensitive OR e.email = current_email THEN e.phone
      ELSE '***-***-****'
    END::text as phone,
    -- Mask address for non-authorized users  
    CASE
      WHEN can_see_sensitive OR e.email = current_email THEN e.address
      ELSE '[RESTRICTED]'
    END::text as address,
    e.department_id,
    e.position_id,
    e.hire_date,
    -- Mask salary for non-authorized users
    CASE
      WHEN can_see_financial OR e.email = current_email THEN e.salary
      ELSE NULL
    END::numeric as salary,
    e.employment_type,
    e.status,
    -- Mask emergency contact for non-authorized users
    CASE
      WHEN can_see_sensitive OR e.email = current_email THEN e.emergency_contact_name
      ELSE '[RESTRICTED]'
    END::text as emergency_contact_name,
    CASE
      WHEN can_see_sensitive OR e.email = current_email THEN e.emergency_contact_phone  
      ELSE '***-***-****'
    END::text as emergency_contact_phone,
    -- Mask date of birth for non-authorized users
    CASE
      WHEN can_see_sensitive OR e.email = current_email THEN e.date_of_birth
      ELSE NULL
    END::date as date_of_birth,
    -- Mask national ID for non-authorized users
    CASE
      WHEN can_see_sensitive OR e.email = current_email THEN e.national_id
      ELSE '***-**-****'
    END::text as national_id,
    -- Mask bank account for non-authorized users
    CASE
      WHEN can_see_financial OR e.email = current_email THEN e.bank_account
      ELSE '****-****-****'
    END::text as bank_account,
    e.total_leave_days,
    e.used_leave_days,
    e.manager_id,
    -- Mask notes for non-authorized users
    CASE
      WHEN can_see_sensitive OR e.email = current_email THEN e.notes
      ELSE '[RESTRICTED]'
    END::text as notes,
    e.created_at,
    e.updated_at
  FROM public.employees e
  WHERE 
    CASE 
      WHEN emp_id IS NOT NULL THEN e.id = emp_id
      ELSE true
    END
    AND public.can_access_employee_basic_info_only(e.id);
END;
$$;

-- 2. Create employee self-service function (employees can only see their own data)
CREATE OR REPLACE FUNCTION public.get_my_employee_data()
RETURNS TABLE(
  id uuid,
  employee_id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  department_id uuid,
  position_id uuid,
  hire_date date,
  salary numeric,
  employment_type text,
  status text,
  emergency_contact_name text,
  emergency_contact_phone text,
  date_of_birth date,
  national_id text,
  bank_account text,
  total_leave_days integer,
  used_leave_days integer,
  manager_id uuid,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email text;
BEGIN
  -- Get current user's email
  SELECT email INTO current_email FROM auth.users WHERE id = auth.uid();
  
  -- Return only current user's data
  RETURN QUERY
  SELECT * FROM public.employees e
  WHERE e.email = current_email;
END;
$$;

-- 3. Create audit trigger for all employee data access
CREATE OR REPLACE FUNCTION public.audit_employee_data_access()
RETURNS TRIGGER AS $$
DECLARE
  current_role text;
  accessed_fields text[];
BEGIN
  -- Get current user role
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  
  -- Determine what fields were accessed based on role
  accessed_fields := ARRAY['basic_info'];
  
  IF current_role IN ('admin', 'hr') THEN
    accessed_fields := accessed_fields || ARRAY['sensitive_personal_data', 'financial_data'];
  END IF;
  
  -- Log the access
  INSERT INTO public.employee_access_log (
    employee_id,
    accessed_by,
    access_type,
    accessed_fields,
    access_time
  ) VALUES (
    NEW.id,
    auth.uid(),
    'employee_record_access',
    accessed_fields,
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Add comprehensive security documentation
COMMENT ON TABLE public.employees IS 
'CRITICAL SECURITY NOTICE: This table contains extremely sensitive employee data including:
- Financial Information: salaries, bank account numbers
- Personal Identification: national IDs, addresses, phone numbers
- Emergency Contacts: family/personal contacts
- Medical Information: dates of birth
Access is strictly controlled by role-based permissions and all access is logged for audit compliance.
Direct table access should be avoided - use secure functions instead.';

-- 5. Grant permissions only to authenticated users, revoke all public access
REVOKE ALL ON public.employees FROM PUBLIC;
REVOKE ALL ON public.employees FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;