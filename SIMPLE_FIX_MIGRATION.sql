-- =====================================================
-- SIMPLE FIX - Only fixes orders table constraints
-- Run this if previous migrations partially completed
-- =====================================================

-- Fix any invalid data in orders table
UPDATE public.orders 
SET guest_type = 'table' 
WHERE guest_type NOT IN ('room', 'table', 'standalone');

UPDATE public.orders 
SET status = 'active' 
WHERE status NOT IN ('active', 'paid', 'cancelled');

-- Drop and recreate constraints
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_guest_type_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_guest_type_check 
CHECK (guest_type IN ('room', 'table', 'standalone'));

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('active', 'paid', 'cancelled'));

-- Ensure foreign key exists
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.orders(id) 
ON DELETE CASCADE;

-- DONE! This fixes the payment/orders issue
