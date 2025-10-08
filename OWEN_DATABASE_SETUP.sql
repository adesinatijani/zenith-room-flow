-- =====================================================
-- SQL SETUP FOR OWEN'S DATABASE
-- Run this in Supabase SQL Editor to enable automatic
-- menu item creation from inventory drinks
-- =====================================================

-- 1. Add missing columns to menu_items table if they don't exist
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;

ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS tracks_inventory boolean DEFAULT false;

ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS inventory_item_id uuid REFERENCES public.inventory(id) ON DELETE SET NULL;

-- 2. Create the function that auto-creates menu items for drinks
CREATE OR REPLACE FUNCTION public.create_menu_item_for_drink()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create menu item for drink categories (case-insensitive matching)
  IF LOWER(NEW.category) IN ('soft drinks', 'alcoholic beverages', 'spirits', 'hot beverages', 'beer', 'wine', 'liquor', 'juice', 'water', 'energy drinks', 'cocktails', 'drinks', 'beverages') THEN
    INSERT INTO public.menu_items (
      name,
      category,
      description,
      price,
      cost_price,
      tracks_inventory,
      inventory_item_id,
      is_available
    ) VALUES (
      NEW.item_name,
      NEW.category,
      'Drink item from inventory',
      0, -- Price to be set in Menu Management
      NEW.cost_per_unit,
      true,
      NEW.id,
      false -- Not available until price is set
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Create the trigger on inventory table
DROP TRIGGER IF EXISTS create_menu_item_for_drink_trigger ON public.inventory;
CREATE TRIGGER create_menu_item_for_drink_trigger
  AFTER INSERT ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.create_menu_item_for_drink();

-- 3. Also create the function that updates menu item cost when inventory cost changes
CREATE OR REPLACE FUNCTION public.update_menu_item_cost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update linked menu item's cost price when inventory cost changes
  IF NEW.cost_per_unit != OLD.cost_per_unit THEN
    UPDATE public.menu_items
    SET cost_price = NEW.cost_per_unit,
        updated_at = now()
    WHERE inventory_item_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. Create the trigger for updating menu item costs
DROP TRIGGER IF EXISTS update_menu_item_cost_trigger ON public.inventory;
CREATE TRIGGER update_menu_item_cost_trigger
  AFTER UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_menu_item_cost();

-- DONE! Now when Owen adds drinks to inventory, they'll automatically appear in menu items
