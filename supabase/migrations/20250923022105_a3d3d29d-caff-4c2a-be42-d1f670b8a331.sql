-- Fix function search path security warning
-- Ensure all functions have immutable search_path set

CREATE OR REPLACE FUNCTION public.audit_sensitive_employee_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access to sensitive employee data
  INSERT INTO public.employee_access_log (
    employee_id,
    accessed_by,
    access_type, 
    accessed_fields,
    access_time
  ) VALUES (
    NEW.id,
    auth.uid(),
    'sensitive_view_access',
    ARRAY['national_id', 'date_of_birth', 'address', 'emergency_contact_name', 'emergency_contact_phone'],
    now()
  );
  
  RETURN NEW;
END;
$$;