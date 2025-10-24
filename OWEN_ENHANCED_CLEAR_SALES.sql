-- =====================================================
-- ENHANCED FIX: Clear All Sales - Force Room Bookings Deletion
-- =====================================================
-- This fixes the issue where room_bookings are not being cleared
-- Owen's Database: mlvchryhaioxcrywwgwl
-- =====================================================

-- Step 1: Drop existing function
DROP FUNCTION IF EXISTS public.clear_sales_data(text);

-- Step 2: Create enhanced clear_sales_data function with better error handling
CREATE OR REPLACE FUNCTION public.clear_sales_data(data_type text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
  orders_deleted INTEGER := 0;
  bookings_deleted INTEGER := 0;
  game_sessions_deleted INTEGER := 0;
  account_entries_deleted INTEGER := 0;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can clear sales data';
  END IF;

  -- Clear based on data type
  CASE data_type
    WHEN 'orders' THEN
      -- Clear all orders
      DELETE FROM public.orders WHERE id IS NOT NULL OR id IS NULL;
      GET DIAGNOSTICS orders_deleted = ROW_COUNT;
      deleted_count := orders_deleted;
      
    WHEN 'bookings' THEN
      -- Force clear ALL room bookings (bypass any issues)
      DELETE FROM public.room_bookings;
      GET DIAGNOSTICS bookings_deleted = ROW_COUNT;
      
      -- If that didn't work, try with WHERE clause
      IF bookings_deleted = 0 THEN
        DELETE FROM public.room_bookings WHERE id IS NOT NULL OR id IS NULL;
        GET DIAGNOSTICS bookings_deleted = ROW_COUNT;
      END IF;
      
      deleted_count := bookings_deleted;
      
    WHEN 'all_sales' THEN
      -- Clear ALL room bookings FIRST (most important)
      DELETE FROM public.room_bookings;
      GET DIAGNOSTICS bookings_deleted = ROW_COUNT;
      
      -- Try again with WHERE clause if needed
      IF bookings_deleted = 0 THEN
        DELETE FROM public.room_bookings WHERE id IS NOT NULL OR id IS NULL;
        GET DIAGNOSTICS bookings_deleted = ROW_COUNT;
      END IF;
      
      -- Clear all orders
      DELETE FROM public.orders WHERE id IS NOT NULL OR id IS NULL;
      GET DIAGNOSTICS orders_deleted = ROW_COUNT;
      
      -- Clear all game sessions
      DELETE FROM public.game_sessions WHERE id IS NOT NULL OR id IS NULL;
      GET DIAGNOSTICS game_sessions_deleted = ROW_COUNT;
      
      -- Clear all account entries
      DELETE FROM public.account_entries WHERE id IS NOT NULL OR id IS NULL;
      GET DIAGNOSTICS account_entries_deleted = ROW_COUNT;
      
      deleted_count := orders_deleted + bookings_deleted + game_sessions_deleted + account_entries_deleted;
      
    ELSE
      RAISE EXCEPTION 'Invalid data type: %', data_type;
  END CASE;

  -- Log the clearing action
  INSERT INTO public.sales_data_clear_log (cleared_by, data_type, record_count)
  VALUES (auth.uid(), data_type, deleted_count);

  result := json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'orders_deleted', orders_deleted,
    'bookings_deleted', bookings_deleted,
    'game_sessions_deleted', game_sessions_deleted,
    'account_entries_deleted', account_entries_deleted,
    'data_type', data_type
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.clear_sales_data(text) TO authenticated;

-- =====================================================
-- Step 3: Reset all room statuses to available
-- =====================================================
UPDATE public.rooms 
SET status = 'available'
WHERE status != 'available';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries after executing the function to verify:
-- 
-- SELECT COUNT(*) FROM room_bookings;  -- Should be 0
-- SELECT COUNT(*) FROM orders;          -- Should be 0  
-- SELECT COUNT(*) FROM game_sessions;   -- Should be 0
-- SELECT COUNT(*) FROM account_entries; -- Should be 0
-- SELECT * FROM rooms WHERE status != 'available'; -- Should be empty
-- =====================================================

-- =====================================================
-- USAGE INSTRUCTIONS FOR OWEN
-- =====================================================
-- 1. Copy this entire SQL file
-- 2. Open Owen's Supabase SQL Editor
-- 3. Paste and execute this SQL
-- 4. Go to the app and click "Clear All Sales" button
-- 5. Hard refresh the browser (Ctrl + Shift + R)
-- 6. All room booking data should now be cleared
-- =====================================================
