-- Create function to automatically create menu item when drink is added to inventory
CREATE OR REPLACE FUNCTION create_menu_item_for_drink()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create menu item for drink categories
  IF NEW.category IN ('soft_drinks', 'beer', 'liquor', 'wine', 'juice', 'water', 'energy_drinks', 'cocktails', 'spirits', 'drinks') THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create menu items for drinks
DROP TRIGGER IF EXISTS create_drink_menu_item_trigger ON public.inventory;
CREATE TRIGGER create_drink_menu_item_trigger
AFTER INSERT ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION create_menu_item_for_drink();

-- Create function to update menu item cost when inventory cost changes
CREATE OR REPLACE FUNCTION update_menu_item_cost()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to sync cost price updates
DROP TRIGGER IF EXISTS sync_menu_item_cost_trigger ON public.inventory;
CREATE TRIGGER sync_menu_item_cost_trigger
AFTER UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION update_menu_item_cost();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_tracks_inventory ON public.menu_items(tracks_inventory, inventory_item_id);

-- Add comment
COMMENT ON FUNCTION create_menu_item_for_drink() IS 'Automatically creates a menu item when a drink is added to inventory';
COMMENT ON FUNCTION update_menu_item_cost() IS 'Syncs menu item cost price when inventory cost changes';