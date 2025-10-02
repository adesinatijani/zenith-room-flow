-- Fix critical security vulnerability: Enable RLS on employee data views
-- This prevents unauthorized access to employee personal information

-- Enable RLS on employee views
ALTER TABLE public.employee_basic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_sensitive_info ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.employee_financial_info ENABLE ROW LEVEL SECURITY;

-- Create secure access policies for employee basic info
CREATE POLICY "Secure access to employee basic info" ON public.employee_basic_info
FOR SELECT TO authenticated
USING (
  -- HR/Admin/Manager can see all basic employee info
  has_hr_access() OR 
  -- Employees can only see their own basic info
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Create secure access policies for employee sensitive info  
CREATE POLICY "Secure access to employee sensitive info" ON public.employee_sensitive_info
FOR SELECT TO authenticated
USING (
  -- Only HR/Admin can see sensitive info of others, employees can see their own
  has_hr_access() OR 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Create secure access policies for employee financial info
CREATE POLICY "Secure access to employee financial info" ON public.employee_financial_info  
FOR SELECT TO authenticated
USING (
  -- Only HR/Admin can see financial info of others, employees can see their own
  has_hr_access() OR
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_employee_view_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when HR/Admin accesses employee data that's not their own
  IF has_hr_access() AND NEW.email != (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    INSERT INTO public.employee_access_log (
      employee_id,
      accessed_by, 
      access_type,
      accessed_fields,
      access_time
    ) VALUES (
      NEW.id,
      auth.uid(),
      'view_access',
      ARRAY['basic_info'],
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit trigger to basic info view  
CREATE TRIGGER employee_basic_info_access_log
  INSTEAD OF SELECT ON public.employee_basic_info
  FOR EACH ROW EXECUTE FUNCTION public.log_employee_view_access();