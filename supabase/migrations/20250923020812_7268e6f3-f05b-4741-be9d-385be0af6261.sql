-- Complete the employee data security fix by adding secure views

-- Create secure views for different access levels

-- Basic employee info view (safe for managers in same department)
CREATE OR REPLACE VIEW public.employee_basic_info AS
SELECT 
  id, employee_id, first_name, last_name, email, phone, 
  department_id, position_id, employment_type, hire_date, 
  status, total_leave_days, used_leave_days, created_at, updated_at
FROM public.employees
WHERE public.can_access_basic_employee_info(id);

-- Sensitive employee info view (HR and admin only + self)
CREATE OR REPLACE VIEW public.employee_sensitive_info AS
SELECT 
  id, employee_id, first_name, last_name, email, phone,
  department_id, position_id, employment_type, hire_date, status,
  date_of_birth, address, national_id, 
  emergency_contact_name, emergency_contact_phone,
  total_leave_days, used_leave_days, manager_id, notes,
  created_at, updated_at
FROM public.employees
WHERE public.can_access_sensitive_employee_info(id);

-- Financial employee info view (HR and admin only + self)
CREATE OR REPLACE VIEW public.employee_financial_info AS
SELECT 
  id, employee_id, first_name, last_name, email,
  department_id, position_id, salary, bank_account,
  created_at, updated_at
FROM public.employees
WHERE public.can_access_financial_employee_info(id);

-- Grant access to the secure views
GRANT SELECT ON public.employee_basic_info TO authenticated;
GRANT SELECT ON public.employee_sensitive_info TO authenticated;
GRANT SELECT ON public.employee_financial_info TO authenticated;

-- Create helper function to get employee data by access level
CREATE OR REPLACE FUNCTION public.get_employee_by_access_level(emp_id uuid, access_level text DEFAULT 'basic')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  CASE access_level
    WHEN 'basic' THEN
      SELECT row_to_json(e) INTO result 
      FROM public.employee_basic_info e 
      WHERE e.id = emp_id;
      
    WHEN 'sensitive' THEN
      SELECT row_to_json(e) INTO result 
      FROM public.employee_sensitive_info e 
      WHERE e.id = emp_id;
      
    WHEN 'financial' THEN
      SELECT row_to_json(e) INTO result 
      FROM public.employee_financial_info e 
      WHERE e.id = emp_id;
      
    ELSE
      SELECT row_to_json(e) INTO result 
      FROM public.employee_basic_info e 
      WHERE e.id = emp_id;
  END CASE;
  
  RETURN result;
END;
$$;

-- Create function to get current user's accessible employees
CREATE OR REPLACE FUNCTION public.get_my_accessible_employees(access_level text DEFAULT 'basic')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result json;
  current_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  
  CASE access_level
    WHEN 'basic' THEN
      SELECT json_agg(row_to_json(e)) INTO result 
      FROM public.employee_basic_info e;
      
    WHEN 'sensitive' THEN
      -- Only HR and Admin can get sensitive data for multiple employees
      IF current_role IN ('admin', 'hr') THEN
        SELECT json_agg(row_to_json(e)) INTO result 
        FROM public.employee_sensitive_info e;
      ELSE
        -- Regular users only get their own sensitive data
        SELECT json_agg(row_to_json(e)) INTO result 
        FROM public.employee_sensitive_info e
        WHERE e.email = (SELECT email FROM auth.users WHERE id = auth.uid());
      END IF;
      
    WHEN 'financial' THEN
      -- Only HR and Admin can get financial data for multiple employees
      IF current_role IN ('admin', 'hr') THEN
        SELECT json_agg(row_to_json(e)) INTO result 
        FROM public.employee_financial_info e;
      ELSE
        -- Regular users only get their own financial data
        SELECT json_agg(row_to_json(e)) INTO result 
        FROM public.employee_financial_info e
        WHERE e.email = (SELECT email FROM auth.users WHERE id = auth.uid());
      END IF;
      
    ELSE
      SELECT json_agg(row_to_json(e)) INTO result 
      FROM public.employee_basic_info e;
  END CASE;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;