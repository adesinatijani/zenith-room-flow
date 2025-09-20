-- Comprehensive Security Implementation Following Industry Best Practices
-- This addresses all identified security vulnerabilities in the hotel management system

-- Create comprehensive role-based access control functions
CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_management_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_kitchen_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'kitchen', 'staff');
END;
$$;

-- 1. HOTEL_SETTINGS TABLE - Protect business configuration
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'hotel_settings' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.hotel_settings';
    END LOOP;
END $$;

CREATE POLICY "hotel_settings_management_only_select" 
ON public.hotel_settings 
FOR SELECT TO authenticated
USING (public.has_management_access());

CREATE POLICY "hotel_settings_management_only_insert" 
ON public.hotel_settings 
FOR INSERT TO authenticated
WITH CHECK (public.has_management_access());

CREATE POLICY "hotel_settings_management_only_update" 
ON public.hotel_settings 
FOR UPDATE TO authenticated
USING (public.has_management_access())
WITH CHECK (public.has_management_access());

CREATE POLICY "hotel_settings_admin_only_delete" 
ON public.hotel_settings 
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 2. INVENTORY TABLE - Protect inventory and supplier data
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'inventory' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.inventory';
    END LOOP;
END $$;

CREATE POLICY "inventory_staff_access_select" 
ON public.inventory 
FOR SELECT TO authenticated
USING (public.has_hotel_staff_access());

CREATE POLICY "inventory_management_insert" 
ON public.inventory 
FOR INSERT TO authenticated
WITH CHECK (public.has_management_access() OR 
           (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement');

CREATE POLICY "inventory_management_update" 
ON public.inventory 
FOR UPDATE TO authenticated
USING (public.has_management_access() OR 
       (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement')
WITH CHECK (public.has_management_access() OR 
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement');

CREATE POLICY "inventory_admin_delete" 
ON public.inventory 
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. KITCHEN_ORDERS TABLE - Protect customer order data
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'kitchen_orders' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.kitchen_orders';
    END LOOP;
END $$;

CREATE POLICY "kitchen_orders_kitchen_access_select" 
ON public.kitchen_orders 
FOR SELECT TO authenticated
USING (public.has_kitchen_access());

CREATE POLICY "kitchen_orders_kitchen_access_insert" 
ON public.kitchen_orders 
FOR INSERT TO authenticated
WITH CHECK (public.has_kitchen_access());

CREATE POLICY "kitchen_orders_kitchen_access_update" 
ON public.kitchen_orders 
FOR UPDATE TO authenticated
USING (public.has_kitchen_access())
WITH CHECK (public.has_kitchen_access());

CREATE POLICY "kitchen_orders_management_delete" 
ON public.kitchen_orders 
FOR DELETE TO authenticated
USING (public.has_management_access());

-- 4. ORDER_ITEMS TABLE - Protect customer purchase data
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'order_items' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.order_items';
    END LOOP;
END $$;

CREATE POLICY "order_items_staff_access_select" 
ON public.order_items 
FOR SELECT TO authenticated
USING (public.has_hotel_staff_access());

CREATE POLICY "order_items_staff_access_insert" 
ON public.order_items 
FOR INSERT TO authenticated
WITH CHECK (public.has_hotel_staff_access());

CREATE POLICY "order_items_staff_access_update" 
ON public.order_items 
FOR UPDATE TO authenticated
USING (public.has_hotel_staff_access())
WITH CHECK (public.has_hotel_staff_access());

CREATE POLICY "order_items_management_delete" 
ON public.order_items 
FOR DELETE TO authenticated
USING (public.has_management_access());

-- 5. RESTAURANT_TABLES TABLE - Protect restaurant layout
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'restaurant_tables' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.restaurant_tables';
    END LOOP;
END $$;

CREATE POLICY "restaurant_tables_staff_access_select" 
ON public.restaurant_tables 
FOR SELECT TO authenticated
USING (public.has_hotel_staff_access());

CREATE POLICY "restaurant_tables_management_modify" 
ON public.restaurant_tables 
FOR INSERT TO authenticated
WITH CHECK (public.has_management_access());

CREATE POLICY "restaurant_tables_management_update" 
ON public.restaurant_tables 
FOR UPDATE TO authenticated
USING (public.has_management_access())
WITH CHECK (public.has_management_access());

CREATE POLICY "restaurant_tables_management_delete" 
ON public.restaurant_tables 
FOR DELETE TO authenticated
USING (public.has_management_access());

-- 6. ROOMS TABLE - Protect room pricing and amenity data
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'rooms' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.rooms';
    END LOOP;
END $$;

CREATE POLICY "rooms_staff_access_select" 
ON public.rooms 
FOR SELECT TO authenticated
USING (public.has_hotel_staff_access());

CREATE POLICY "rooms_management_modify" 
ON public.rooms 
FOR INSERT TO authenticated
WITH CHECK (public.has_management_access());

CREATE POLICY "rooms_management_update" 
ON public.rooms 
FOR UPDATE TO authenticated
USING (public.has_management_access())
WITH CHECK (public.has_management_access());

CREATE POLICY "rooms_admin_delete" 
ON public.rooms 
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 7. STAFF_RECOGNITION TABLE - Restrict to internal staff only
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'staff_recognition' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.staff_recognition';
    END LOOP;
END $$;

CREATE POLICY "staff_recognition_staff_access_select" 
ON public.staff_recognition 
FOR SELECT TO authenticated
USING (public.has_hotel_staff_access());

CREATE POLICY "staff_recognition_hr_access_insert" 
ON public.staff_recognition 
FOR INSERT TO authenticated
WITH CHECK (public.has_hr_access());

CREATE POLICY "staff_recognition_hr_access_update" 
ON public.staff_recognition 
FOR UPDATE TO authenticated
USING (public.has_hr_access())
WITH CHECK (public.has_hr_access());

CREATE POLICY "staff_recognition_admin_delete" 
ON public.staff_recognition 
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 8. STAFF_VOTES TABLE - Require authentication and restrict manipulation
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'staff_votes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.staff_votes';
    END LOOP;
END $$;

CREATE POLICY "staff_votes_authenticated_select" 
ON public.staff_votes 
FOR SELECT TO authenticated
USING (public.has_hotel_staff_access());

CREATE POLICY "staff_votes_authenticated_insert" 
ON public.staff_votes 
FOR INSERT TO authenticated
WITH CHECK (public.has_hotel_staff_access());

-- No update/delete to prevent vote manipulation
CREATE POLICY "staff_votes_admin_delete" 
ON public.staff_votes 
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 9. DEPARTMENTS TABLE - Protect organizational structure
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'departments' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.departments';
    END LOOP;
END $$;

CREATE POLICY "departments_hr_management_select" 
ON public.departments 
FOR SELECT TO authenticated
USING (public.has_hr_access());

CREATE POLICY "departments_admin_modify" 
ON public.departments 
FOR INSERT TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "departments_admin_update" 
ON public.departments 
FOR UPDATE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "departments_admin_delete" 
ON public.departments 
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 10. EMPLOYEE_POSITIONS TABLE - Protect salary ranges
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'employee_positions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.employee_positions';
    END LOOP;
END $$;

CREATE POLICY "employee_positions_hr_management_select" 
ON public.employee_positions 
FOR SELECT TO authenticated
USING (public.has_hr_access());

CREATE POLICY "employee_positions_admin_modify" 
ON public.employee_positions 
FOR INSERT TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "employee_positions_admin_update" 
ON public.employee_positions 
FOR UPDATE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "employee_positions_admin_delete" 
ON public.employee_positions 
FOR DELETE TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');