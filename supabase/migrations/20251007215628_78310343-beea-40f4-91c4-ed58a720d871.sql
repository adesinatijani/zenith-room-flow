-- Drop existing unit check constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_unit_check'
    ) THEN
        ALTER TABLE public.inventory DROP CONSTRAINT inventory_unit_check;
    END IF;
END $$;

-- Add new unit check constraint with more allowed values
ALTER TABLE public.inventory 
ADD CONSTRAINT inventory_unit_check 
CHECK (unit IN (
    'units', 'pieces', 'kg', 'g', 'lbs', 'oz',
    'liters', 'ml', 'gallons', 
    'bottles', 'cans', 'packets', 'boxes', 'cartons',
    'rolls', 'sheets', 'packs', 'dozen',
    'meters', 'cm', 'inches', 'feet',
    'hours', 'days', 'months'
));

-- Update any existing rows with invalid units to 'pieces'
UPDATE public.inventory 
SET unit = 'pieces' 
WHERE unit NOT IN (
    'units', 'pieces', 'kg', 'g', 'lbs', 'oz',
    'liters', 'ml', 'gallons', 
    'bottles', 'cans', 'packets', 'boxes', 'cartons',
    'rolls', 'sheets', 'packs', 'dozen',
    'meters', 'cm', 'inches', 'feet',
    'hours', 'days', 'months'
);