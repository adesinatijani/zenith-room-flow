-- Update all existing menu items to use null tax_rate so they inherit from global settings
UPDATE menu_items 
SET tax_rate = NULL 
WHERE tax_rate IS NOT NULL;

-- Set default tax_rate to NULL for new items (to inherit from global settings)
ALTER TABLE menu_items 
ALTER COLUMN tax_rate SET DEFAULT NULL;