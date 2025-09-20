-- Fix security issues by handling dependencies properly

-- First drop the dependent policy that references the function
DROP POLICY IF EXISTS "Only admins can view access logs" ON public.employee_access_log;

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.employee_self_view;

-- Now we can safely recreate functions with proper search paths
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
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

DROP FUNCTION IF EXISTS public.is_hr_admin() CASCADE;
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

DROP FUNCTION IF EXISTS public.can_manage_employee(uuid) CASCADE;
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

-- Recreate the access log policy with the updated function
CREATE POLICY "Only admins can view access logs"
ON public.employee_access_log
FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Update other existing functions to have proper search paths (using CREATE OR REPLACE)
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

-- Recreate the employee self-service view WITHOUT security definer
CREATE VIEW public.employee_self_view AS
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
FROM public.employees e;

-- Enable security barrier (but NOT security definer)
ALTER VIEW public.employee_self_view SET (security_barrier = true);

-- Grant access to the view - RLS on underlying table will control access
GRANT SELECT ON public.employee_self_view TO authenticated;

-- Add helpful comments
COMMENT ON VIEW public.employee_self_view IS 
'Secure view for employee self-service. Access is controlled by RLS policies on the underlying employees table.';

COMMENT ON FUNCTION public.get_current_user_role() IS 
'Security definer function to safely get user role. Uses immutable search_path for security.';

COMMENT ON FUNCTION public.is_hr_admin() IS 
'Security definer function to check HR/admin privileges. Uses immutable search_path for security.';

COMMENT ON FUNCTION public.can_manage_employee(uuid) IS 
'Security definer function to check employee management permissions. Uses immutable search_path for security.';

-- Create additional security function for employee data access checks
CREATE OR REPLACE FUNCTION public.can_view_employee_sensitive_data(employee_uuid uuid)
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
  
  -- Only HR/Admin/Manager can see sensitive data like salary, bank account, etc.
  RETURN current_user_role IN ('admin', 'hr', 'manager');
END;
$$;

COMMENT ON FUNCTION public.can_view_employee_sensitive_data(uuid) IS 
'Security function to determine if user can access sensitive employee data like salary, bank details.';

-- Ensure all other existing functions also have proper search paths
CREATE OR REPLACE FUNCTION public.update_room_status_after_booking()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Update room status to occupied when booking is active
    IF NEW.booking_status = 'active' AND NEW.payment_status = 'paid' THEN
        UPDATE public.rooms 
        SET status = 'occupied', updated_at = now()
        WHERE id = NEW.room_id;
    END IF;
    
    -- Update room status to available when booking ends
    IF NEW.booking_status = 'completed' OR NEW.booking_status = 'cancelled' THEN
        UPDATE public.rooms 
        SET status = 'available', updated_at = now()
        WHERE id = NEW.room_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_inventory_quantity(item_name_param text, quantity_change integer)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.inventory 
    SET current_quantity = GREATEST(0, current_quantity + quantity_change)
    WHERE item_name = item_name_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item % not found in inventory', item_name_param;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check minimum length (8 characters)
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter  
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one digit
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Password meets all criteria
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_supplier_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Update supplier total orders and amount when order is confirmed or delivered
    IF NEW.status IN ('confirmed', 'delivered') AND (OLD.status != NEW.status OR OLD IS NULL) THEN
        UPDATE public.suppliers 
        SET 
            total_orders = (
                SELECT COUNT(*) 
                FROM public.supplier_orders 
                WHERE supplier_id = NEW.supplier_id 
                AND status IN ('confirmed', 'delivered')
            ),
            total_amount = (
                SELECT COALESCE(SUM(total_amount), 0) 
                FROM public.supplier_orders 
                WHERE supplier_id = NEW.supplier_id 
                AND status IN ('confirmed', 'delivered')
            ),
            last_order_date = NEW.order_date
        WHERE id = NEW.supplier_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_order_total()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Update order total when items are added/updated/deleted
    UPDATE public.supplier_orders 
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM public.supplier_order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_monthly_winner()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- This function can be used to automatically update winners
  -- when voting period ends (to be called manually or via cron)
  RETURN NEW;
END;
$$;