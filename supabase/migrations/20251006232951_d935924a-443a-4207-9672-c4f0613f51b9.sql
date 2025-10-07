-- Drop existing trigger
DROP TRIGGER IF EXISTS create_drink_menu_item_trigger ON public.inventory;
DROP FUNCTION IF EXISTS public.create_menu_item_for_drink();

-- Create updated function that matches actual category values
CREATE OR REPLACE FUNCTION public.create_menu_item_for_drink()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create menu item for drink categories (case-insensitive matching)
  IF LOWER(NEW.category) IN ('soft drinks', 'alcoholic beverages', 'spirits', 'hot beverages', 'beer', 'wine', 'liquor', 'juice', 'water', 'energy drinks', 'cocktails', 'drinks') THEN
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
$$;

-- Recreate trigger
CREATE TRIGGER create_drink_menu_item_trigger
  AFTER INSERT ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.create_menu_item_for_drink();

-- Backfill menu items for existing drink inventory items
INSERT INTO public.menu_items (
  name,
  category,
  description,
  price,
  cost_price,
  tracks_inventory,
  inventory_item_id,
  is_available
)
SELECT 
  i.item_name,
  i.category,
  'Drink item from inventory',
  0,
  i.cost_per_unit,
  true,
  i.id,
  false
FROM public.inventory i
WHERE LOWER(i.category) IN ('soft drinks', 'alcoholic beverages', 'spirits', 'hot beverages', 'beer', 'wine', 'liquor', 'juice', 'water', 'energy drinks', 'cocktails', 'drinks')
AND NOT EXISTS (
  SELECT 1 FROM public.menu_items m WHERE m.inventory_item_id = i.id
);