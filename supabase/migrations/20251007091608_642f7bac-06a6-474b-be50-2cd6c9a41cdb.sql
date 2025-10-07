-- Add tax_rate column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN tax_rate NUMERIC DEFAULT 7.5;

-- Add tax_rate column to rooms table
ALTER TABLE public.rooms
ADD COLUMN tax_rate NUMERIC DEFAULT 7.5;

-- Update existing menu_items to use default tax rate from hotel_settings
UPDATE public.menu_items
SET tax_rate = (SELECT tax_rate FROM public.hotel_settings LIMIT 1)
WHERE tax_rate = 7.5;

-- Update existing rooms to use default tax rate from hotel_settings
UPDATE public.rooms
SET tax_rate = (SELECT tax_rate FROM public.hotel_settings LIMIT 1)
WHERE tax_rate = 7.5;

COMMENT ON COLUMN public.menu_items.tax_rate IS 'Tax rate percentage for this menu item (overrides global tax_rate)';
COMMENT ON COLUMN public.rooms.tax_rate IS 'Tax rate percentage for this room (overrides global tax_rate)';