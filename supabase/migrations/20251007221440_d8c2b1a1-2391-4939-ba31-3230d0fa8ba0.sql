-- Create trigger to automatically create menu items for drinks added to inventory
DROP TRIGGER IF EXISTS create_drink_menu_item_trigger ON public.inventory;

CREATE TRIGGER create_drink_menu_item_trigger
  AFTER INSERT ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.create_menu_item_for_drink();