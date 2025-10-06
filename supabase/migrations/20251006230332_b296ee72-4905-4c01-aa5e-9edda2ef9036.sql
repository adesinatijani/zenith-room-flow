-- Add inventory tracking fields to menu_items
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS inventory_item_id uuid REFERENCES public.inventory(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tracks_inventory boolean DEFAULT false;

-- Add drink-specific categories if they don't exist
-- We'll use the existing category field with specific drink values

-- Create index for better performance on inventory lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_inventory ON public.menu_items(inventory_item_id) WHERE inventory_item_id IS NOT NULL;

COMMENT ON COLUMN public.menu_items.cost_price IS 'Cost price for calculating profit margins';
COMMENT ON COLUMN public.menu_items.inventory_item_id IS 'Links menu item to inventory for stock tracking';
COMMENT ON COLUMN public.menu_items.tracks_inventory IS 'Whether this item should deduct from inventory on sale';