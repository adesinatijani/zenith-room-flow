-- Update the create_menu_item_for_drink function to include 'beverages' category
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