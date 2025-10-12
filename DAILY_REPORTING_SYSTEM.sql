-- =====================================================
-- DAILY REPORTING & HISTORICAL SUMMARIES SYSTEM
-- This creates a system to automatically store daily snapshots
-- Run this AFTER the accounting module setup
-- =====================================================

-- 1. CREATE DAILY SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS public.daily_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_date DATE NOT NULL UNIQUE,
  
  -- Revenue breakdown
  room_revenue NUMERIC(15,2) DEFAULT 0,
  restaurant_revenue NUMERIC(15,2) DEFAULT 0,
  bar_revenue NUMERIC(15,2) DEFAULT 0,
  gym_revenue NUMERIC(15,2) DEFAULT 0,
  other_revenue NUMERIC(15,2) DEFAULT 0,
  total_revenue NUMERIC(15,2) DEFAULT 0,
  
  -- Expense breakdown
  cogs NUMERIC(15,2) DEFAULT 0,
  salaries NUMERIC(15,2) DEFAULT 0,
  utilities NUMERIC(15,2) DEFAULT 0,
  maintenance NUMERIC(15,2) DEFAULT 0,
  other_expenses NUMERIC(15,2) DEFAULT 0,
  total_expenses NUMERIC(15,2) DEFAULT 0,
  
  -- Financial summary
  gross_profit NUMERIC(15,2) DEFAULT 0,
  net_income NUMERIC(15,2) DEFAULT 0,
  
  -- Accounting totals
  total_assets NUMERIC(15,2) DEFAULT 0,
  total_liabilities NUMERIC(15,2) DEFAULT 0,
  total_equity NUMERIC(15,2) DEFAULT 0,
  
  -- Transaction counts
  booking_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  gym_session_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CREATE INDEX FOR FAST DATE QUERIES
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON public.daily_summaries(summary_date DESC);

-- 3. ENABLE RLS ON DAILY SUMMARIES
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES FOR DAILY SUMMARIES
DROP POLICY IF EXISTS "Financial staff can view daily summaries" ON public.daily_summaries;
CREATE POLICY "Financial staff can view daily summaries"
  ON public.daily_summaries FOR SELECT
  USING (has_financial_access());

DROP POLICY IF EXISTS "Only admins can insert daily summaries" ON public.daily_summaries;
CREATE POLICY "Only admins can insert daily summaries"
  ON public.daily_summaries FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Only admins can update daily summaries" ON public.daily_summaries;
CREATE POLICY "Only admins can update daily summaries"
  ON public.daily_summaries FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Only admins can delete daily summaries" ON public.daily_summaries;
CREATE POLICY "Only admins can delete daily summaries"
  ON public.daily_summaries FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. CREATE FUNCTION TO GENERATE DAILY SUMMARY
CREATE OR REPLACE FUNCTION public.generate_daily_summary(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_revenue NUMERIC(15,2);
  v_restaurant_revenue NUMERIC(15,2);
  v_bar_revenue NUMERIC(15,2);
  v_gym_revenue NUMERIC(15,2);
  v_total_revenue NUMERIC(15,2);
  v_total_expenses NUMERIC(15,2);
  v_total_assets NUMERIC(15,2);
  v_total_liabilities NUMERIC(15,2);
  v_total_equity NUMERIC(15,2);
  v_booking_count INTEGER;
  v_order_count INTEGER;
  v_gym_count INTEGER;
BEGIN
  -- Calculate room revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_room_revenue
  FROM public.room_bookings
  WHERE DATE(created_at) = target_date
    AND payment_status = 'paid';
  
  -- Calculate restaurant revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_restaurant_revenue
  FROM public.orders
  WHERE DATE(created_at) = target_date
    AND status = 'paid'
    AND guest_type = 'walk-in';
  
  -- Calculate bar revenue (assuming orders with guest_type 'bar')
  SELECT COALESCE(SUM(total_amount), 0) INTO v_bar_revenue
  FROM public.orders
  WHERE DATE(created_at) = target_date
    AND status = 'paid'
    AND guest_type = 'bar';
  
  -- Calculate gym/game revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_gym_revenue
  FROM public.game_sessions
  WHERE DATE(created_at) = target_date
    AND payment_status = 'paid';
  
  -- Get transaction counts
  SELECT COUNT(*) INTO v_booking_count
  FROM public.room_bookings
  WHERE DATE(created_at) = target_date
    AND payment_status = 'paid';
  
  SELECT COUNT(*) INTO v_order_count
  FROM public.orders
  WHERE DATE(created_at) = target_date
    AND status = 'paid';
  
  SELECT COUNT(*) INTO v_gym_count
  FROM public.game_sessions
  WHERE DATE(created_at) = target_date
    AND payment_status = 'paid';
  
  -- Get accounting totals from posted entries
  SELECT 
    COALESCE(SUM(CASE WHEN ac.account_type = 'asset' THEN ae.debit_amount - ae.credit_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN ac.account_type = 'liability' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN ac.account_type = 'equity' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0)
  INTO v_total_assets, v_total_liabilities, v_total_equity
  FROM public.account_entries ae
  LEFT JOIN public.account_categories ac ON ae.category_id = ac.id
  WHERE DATE(ae.entry_date) <= target_date
    AND ae.status = 'posted';
  
  -- Get expenses from account entries
  SELECT COALESCE(SUM(ae.debit_amount - ae.credit_amount), 0) INTO v_total_expenses
  FROM public.account_entries ae
  LEFT JOIN public.account_categories ac ON ae.category_id = ac.id
  WHERE DATE(ae.entry_date) = target_date
    AND ae.status = 'posted'
    AND ac.account_type = 'expense';
  
  -- Calculate total revenue
  v_total_revenue := v_room_revenue + v_restaurant_revenue + v_bar_revenue + v_gym_revenue;
  
  -- Insert or update the daily summary
  INSERT INTO public.daily_summaries (
    summary_date,
    room_revenue,
    restaurant_revenue,
    bar_revenue,
    gym_revenue,
    total_revenue,
    total_expenses,
    gross_profit,
    net_income,
    total_assets,
    total_liabilities,
    total_equity,
    booking_count,
    order_count,
    gym_session_count
  ) VALUES (
    target_date,
    v_room_revenue,
    v_restaurant_revenue,
    v_bar_revenue,
    v_gym_revenue,
    v_total_revenue,
    v_total_expenses,
    v_total_revenue - v_total_expenses,
    v_total_revenue - v_total_expenses,
    v_total_assets,
    v_total_liabilities,
    v_total_equity,
    v_booking_count,
    v_order_count,
    v_gym_count
  )
  ON CONFLICT (summary_date) 
  DO UPDATE SET
    room_revenue = EXCLUDED.room_revenue,
    restaurant_revenue = EXCLUDED.restaurant_revenue,
    bar_revenue = EXCLUDED.bar_revenue,
    gym_revenue = EXCLUDED.gym_revenue,
    total_revenue = EXCLUDED.total_revenue,
    total_expenses = EXCLUDED.total_expenses,
    gross_profit = EXCLUDED.gross_profit,
    net_income = EXCLUDED.net_income,
    total_assets = EXCLUDED.total_assets,
    total_liabilities = EXCLUDED.total_liabilities,
    total_equity = EXCLUDED.total_equity,
    booking_count = EXCLUDED.booking_count,
    order_count = EXCLUDED.order_count,
    gym_session_count = EXCLUDED.gym_session_count,
    updated_at = now();
    
END;
$$;

-- 6. CREATE FUNCTION TO AUTO-GENERATE YESTERDAY'S SUMMARY (for cron job)
CREATE OR REPLACE FUNCTION public.auto_generate_yesterday_summary()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate summary for yesterday
  PERFORM public.generate_daily_summary(CURRENT_DATE - INTERVAL '1 day');
END;
$$;

-- 7. ENABLE PG_CRON EXTENSION (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 8. SCHEDULE AUTOMATIC DAILY SUMMARY GENERATION AT MIDNIGHT
-- This will run every day at 00:05 (5 minutes past midnight)
SELECT cron.schedule(
  'generate-daily-summary-midnight',
  '5 0 * * *',  -- At 00:05 every day
  $$SELECT public.auto_generate_yesterday_summary();$$
);

-- 9. MANUALLY GENERATE SUMMARIES FOR PAST 30 DAYS (One-time setup)
-- Uncomment and run this to backfill historical data
/*
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..30 LOOP
    PERFORM public.generate_daily_summary(CURRENT_DATE - (i || ' days')::INTERVAL);
  END LOOP;
END $$;
*/

-- 10. CREATE VIEW FOR EASY COMPARISON WITH PREVIOUS DAY
CREATE OR REPLACE VIEW public.daily_comparison AS
SELECT 
  today.summary_date as today_date,
  today.total_revenue as today_revenue,
  today.total_expenses as today_expenses,
  today.net_income as today_net_income,
  today.booking_count as today_bookings,
  today.order_count as today_orders,
  
  yesterday.summary_date as yesterday_date,
  yesterday.total_revenue as yesterday_revenue,
  yesterday.total_expenses as yesterday_expenses,
  yesterday.net_income as yesterday_net_income,
  yesterday.booking_count as yesterday_bookings,
  yesterday.order_count as yesterday_orders,
  
  -- Calculate changes
  today.total_revenue - COALESCE(yesterday.total_revenue, 0) as revenue_change,
  today.total_expenses - COALESCE(yesterday.total_expenses, 0) as expenses_change,
  today.net_income - COALESCE(yesterday.net_income, 0) as income_change,
  
  -- Calculate percentage changes
  CASE 
    WHEN COALESCE(yesterday.total_revenue, 0) = 0 THEN 0
    ELSE ROUND(((today.total_revenue - yesterday.total_revenue) / yesterday.total_revenue * 100), 2)
  END as revenue_change_pct,
  
  CASE 
    WHEN COALESCE(yesterday.total_expenses, 0) = 0 THEN 0
    ELSE ROUND(((today.total_expenses - yesterday.total_expenses) / yesterday.total_expenses * 100), 2)
  END as expenses_change_pct,
  
  CASE 
    WHEN COALESCE(yesterday.net_income, 0) = 0 THEN 0
    ELSE ROUND(((today.net_income - yesterday.net_income) / yesterday.net_income * 100), 2)
  END as income_change_pct
  
FROM public.daily_summaries today
LEFT JOIN public.daily_summaries yesterday 
  ON yesterday.summary_date = today.summary_date - INTERVAL '1 day'
ORDER BY today.summary_date DESC;

-- =====================================================
-- SETUP COMPLETE!
-- 
-- Key Features:
-- ✓ Automatic daily snapshot at 00:05 every day
-- ✓ Historical data storage for all financial metrics
-- ✓ Easy comparison views between days
-- ✓ Manual generation function for backfilling
-- 
-- To manually generate a summary for a specific date:
-- SELECT public.generate_daily_summary('2025-01-15');
--
-- To view daily comparisons:
-- SELECT * FROM public.daily_comparison LIMIT 7;
--
-- To backfill last 30 days, uncomment section 9 above
-- =====================================================
