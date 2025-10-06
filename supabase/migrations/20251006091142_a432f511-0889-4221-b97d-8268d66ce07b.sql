-- Drop existing restrictive policies on menu_items
DROP POLICY IF EXISTS "Management can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Management can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Management can delete menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can view menu items" ON menu_items;

-- Create new policies allowing all hotel staff to manage menu items
CREATE POLICY "Staff can view menu items" 
ON menu_items 
FOR SELECT 
USING (has_hotel_staff_access());

CREATE POLICY "Staff can insert menu items" 
ON menu_items 
FOR INSERT 
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can update menu items" 
ON menu_items 
FOR UPDATE 
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can delete menu items" 
ON menu_items 
FOR DELETE 
USING (has_hotel_staff_access());