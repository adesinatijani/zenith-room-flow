-- Add tax_rate column to order_items table
ALTER TABLE public.order_items 
ADD COLUMN tax_rate NUMERIC DEFAULT 7.5;

-- Update existing order_items to use default tax rate
UPDATE public.order_items 
SET tax_rate = 7.5 
WHERE tax_rate IS NULL;