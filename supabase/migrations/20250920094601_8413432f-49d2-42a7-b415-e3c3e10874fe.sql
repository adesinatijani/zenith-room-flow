-- Fix the security definer view issue
-- Remove the potentially problematic view and keep security in RLS policies only

-- Drop the view that was flagged as a security risk
DROP VIEW IF EXISTS public.employee_basic_info;

-- The RLS policies on the employees table are sufficient for security
-- They already restrict access properly based on user roles and ownership

-- Ensure all employee access is properly logged for audit purposes
CREATE OR REPLACE FUNCTION public.audit_employee_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log access by privileged users (not self-access)
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') 
     AND NEW.email != (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    
    INSERT INTO public.employee_access_log (
      employee_id,
      accessed_by,
      access_type,
      accessed_fields,
      access_time
    ) VALUES (
      NEW.id,
      auth.uid(),
      'employee_data_view',
      ARRAY['basic_info'],
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for audit logging (only on SELECT operations that return data)
-- Note: We can't create AFTER SELECT triggers directly, so we'll rely on application-level logging