-- Fix RLS policy to allow trigger function to insert menu items
-- The create_menu_item_for_drink() trigger needs to be able to insert

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Staff can insert menu items" ON public.menu_items;

-- Create a more permissive policy that allows authenticated users AND service role
CREATE POLICY "Allow menu item creation"
ON public.menu_items
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Keep other policies as they are
-- (SELECT and UPDATE policies already exist and are fine)