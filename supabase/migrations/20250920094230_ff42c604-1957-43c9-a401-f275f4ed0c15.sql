-- Fix guest data security by implementing role-based RLS policies
-- This addresses the "Guest Personal Information Could Be Stolen" security issue

-- Create function to check if user can access guest booking data
CREATE OR REPLACE FUNCTION public.has_booking_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only hotel staff roles can access guest booking data
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping');
END;
$$;

-- ROOM_BOOKINGS TABLE - Clean up existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on room_bookings
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'room_bookings' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.room_bookings';
    END LOOP;
END $$;

-- Create new secure policies for room_bookings
CREATE POLICY "secure_booking_select" 
ON public.room_bookings 
FOR SELECT 
TO authenticated
USING (public.has_booking_access());

CREATE POLICY "secure_booking_insert" 
ON public.room_bookings 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_booking_access());

CREATE POLICY "secure_booking_update" 
ON public.room_bookings 
FOR UPDATE 
TO authenticated
USING (public.has_booking_access())
WITH CHECK (public.has_booking_access());

CREATE POLICY "secure_booking_delete" 
ON public.room_bookings 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Also secure other guest-related tables that might contain sensitive data
-- ORDERS TABLE (contains guest information)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on orders
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.orders';
    END LOOP;
END $$;

-- Create secure policies for orders (also contains guest data)
CREATE POLICY "secure_orders_select" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (public.has_booking_access());

CREATE POLICY "secure_orders_insert" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_booking_access());

CREATE POLICY "secure_orders_update" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (public.has_booking_access())
WITH CHECK (public.has_booking_access());

CREATE POLICY "secure_orders_delete" 
ON public.orders 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- SUPPLIERS TABLE - Also needs protection (business data)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on suppliers
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'suppliers' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.suppliers';
    END LOOP;
END $$;

-- Create secure policies for suppliers
CREATE POLICY "secure_suppliers_select" 
ON public.suppliers 
FOR SELECT 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

CREATE POLICY "secure_suppliers_insert" 
ON public.suppliers 
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_suppliers_update" 
ON public.suppliers 
FOR UPDATE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_suppliers_delete" 
ON public.suppliers 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- SUPPLIER_ORDERS and related tables
DO $$
DECLARE
    policy_record RECORD;
    table_name text;
BEGIN
    -- Tables to secure
    FOR table_name IN VALUES ('supplier_orders'), ('supplier_order_items'), ('supplier_payments')
    LOOP
        -- Drop all existing policies
        FOR policy_record IN 
            SELECT policyname FROM pg_policies WHERE tablename = table_name AND schemaname = 'public'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.' || table_name;
        END LOOP;
        
        -- Create new secure policies
        EXECUTE 'CREATE POLICY "secure_' || table_name || '_select" ON public.' || table_name || 
                ' FOR SELECT TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN (''admin'', ''manager'', ''procurement'', ''staff''))';
                
        EXECUTE 'CREATE POLICY "secure_' || table_name || '_insert" ON public.' || table_name || 
                ' FOR INSERT TO authenticated WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN (''admin'', ''manager'', ''procurement''))';
                
        EXECUTE 'CREATE POLICY "secure_' || table_name || '_update" ON public.' || table_name || 
                ' FOR UPDATE TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN (''admin'', ''manager'', ''procurement'')) WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN (''admin'', ''manager'', ''procurement''))';
                
        EXECUTE 'CREATE POLICY "secure_' || table_name || '_delete" ON public.' || table_name || 
                ' FOR DELETE TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN (''admin'', ''manager''))';
    END LOOP;
END $$;