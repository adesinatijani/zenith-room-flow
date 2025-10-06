-- ============================================================================
-- COMPREHENSIVE DATABASE FIX MIGRATION
-- This migration fixes all database issues in the hotel management system
-- ============================================================================

-- ============================================================================
-- PART 1: FIX ORDERS & ORDER_ITEMS RELATIONSHIP
-- ============================================================================

-- Add foreign key constraint between order_items and orders
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.orders(id) 
ON DELETE CASCADE;

-- Fix orders_guest_type_check constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_guest_type_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_guest_type_check 
CHECK (guest_type IN ('room', 'table', 'standalone'));

-- Fix orders_status_check constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('active', 'paid', 'cancelled'));

-- ============================================================================
-- PART 2: CREATE ACCOUNT_CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.account_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  account_code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on account_categories
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Financial staff can view account categories" ON public.account_categories;
DROP POLICY IF EXISTS "Financial staff can insert account categories" ON public.account_categories;
DROP POLICY IF EXISTS "Financial staff can update account categories" ON public.account_categories;
DROP POLICY IF EXISTS "Only admins can delete account categories" ON public.account_categories;

-- RLS Policies for account_categories
CREATE POLICY "Financial staff can view account categories"
ON public.account_categories
FOR SELECT
USING (has_financial_access());

CREATE POLICY "Financial staff can insert account categories"
ON public.account_categories
FOR INSERT
WITH CHECK (has_financial_access());

CREATE POLICY "Financial staff can update account categories"
ON public.account_categories
FOR UPDATE
USING (has_financial_access())
WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete account categories"
ON public.account_categories
FOR DELETE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Add foreign key to account_entries
ALTER TABLE public.account_entries
DROP CONSTRAINT IF EXISTS account_entries_category_id_fkey;

ALTER TABLE public.account_entries
ADD CONSTRAINT account_entries_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.account_categories(id) 
ON DELETE SET NULL;

-- Add foreign key to budgets
ALTER TABLE public.budgets
DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;

ALTER TABLE public.budgets
ADD CONSTRAINT budgets_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.account_categories(id) 
ON DELETE SET NULL;

-- ============================================================================
-- PART 3: CREATE RECIPES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  prep_time INTEGER NOT NULL DEFAULT 0,
  cook_time INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  cost NUMERIC NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT[] NOT NULL DEFAULT '{}'::text[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Staff can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Staff can insert recipes" ON public.recipes;
DROP POLICY IF EXISTS "Staff can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Management can delete recipes" ON public.recipes;

-- RLS Policies for recipes
CREATE POLICY "Staff can view recipes"
ON public.recipes
FOR SELECT
USING (has_hotel_staff_access());

CREATE POLICY "Staff can insert recipes"
ON public.recipes
FOR INSERT
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can update recipes"
ON public.recipes
FOR UPDATE
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Management can delete recipes"
ON public.recipes
FOR DELETE
USING (has_management_access());

-- ============================================================================
-- PART 4: CREATE GYM MANAGEMENT TABLES
-- ============================================================================

-- Create gym_members table
CREATE TABLE IF NOT EXISTS public.gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('Basic', 'Premium', 'VIP')),
  membership_start DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  check_ins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gym_members
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Management can manage gym members" ON public.gym_members;
DROP POLICY IF EXISTS "Staff can view gym members" ON public.gym_members;

-- RLS Policies for gym_members
CREATE POLICY "Management can manage gym members"
ON public.gym_members
FOR ALL
USING (has_management_access())
WITH CHECK (has_management_access());

CREATE POLICY "Staff can view gym members"
ON public.gym_members
FOR SELECT
USING (has_hotel_staff_access());

-- Create gym_equipment table (if not exists)
CREATE TABLE IF NOT EXISTS public.gym_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_order')),
  location TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiration DATE,
  last_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gym_equipment (if not already enabled)
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Management can manage gym equipment" ON public.gym_equipment;
DROP POLICY IF EXISTS "Staff can view gym equipment" ON public.gym_equipment;

CREATE POLICY "Management can manage gym equipment"
ON public.gym_equipment
FOR ALL
USING (has_management_access())
WITH CHECK (has_management_access());

CREATE POLICY "Staff can view gym equipment"
ON public.gym_equipment
FOR SELECT
USING (has_hotel_staff_access());

-- Create gym_trainers table (if not exists)
CREATE TABLE IF NOT EXISTS public.gym_trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT[] NOT NULL DEFAULT '{}'::text[],
  hourly_rate NUMERIC NOT NULL,
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'off_duty')),
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_sessions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gym_trainers
ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Management can manage gym trainers" ON public.gym_trainers;
DROP POLICY IF EXISTS "Staff can view gym trainers" ON public.gym_trainers;

CREATE POLICY "Management can manage gym trainers"
ON public.gym_trainers
FOR ALL
USING (has_management_access())
WITH CHECK (has_management_access());

CREATE POLICY "Staff can view gym trainers"
ON public.gym_trainers
FOR SELECT
USING (has_hotel_staff_access());

-- Create gym_trainer_bookings table
CREATE TABLE IF NOT EXISTS public.gym_trainer_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.gym_trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gym_trainer_bookings
ALTER TABLE public.gym_trainer_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Management can manage trainer bookings" ON public.gym_trainer_bookings;
DROP POLICY IF EXISTS "Staff can view trainer bookings" ON public.gym_trainer_bookings;
DROP POLICY IF EXISTS "Staff can create trainer bookings" ON public.gym_trainer_bookings;

-- RLS Policies for gym_trainer_bookings
CREATE POLICY "Management can manage trainer bookings"
ON public.gym_trainer_bookings
FOR ALL
USING (has_management_access())
WITH CHECK (has_management_access());

CREATE POLICY "Staff can view trainer bookings"
ON public.gym_trainer_bookings
FOR SELECT
USING (has_hotel_staff_access());

CREATE POLICY "Staff can create trainer bookings"
ON public.gym_trainer_bookings
FOR INSERT
WITH CHECK (has_hotel_staff_access());

-- ============================================================================
-- PART 5: ENSURE HELPER FUNCTIONS EXIST
-- ============================================================================

-- Create has_hotel_staff_access function if not exists
CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement', 'hr', 'accounting')
  )
$$;

-- Create has_management_access function if not exists
CREATE OR REPLACE FUNCTION public.has_management_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
  )
$$;

-- Create has_kitchen_access function if not exists
CREATE OR REPLACE FUNCTION public.has_kitchen_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'kitchen', 'staff')
  )
$$;

-- Create has_booking_access function if not exists
CREATE OR REPLACE FUNCTION public.has_booking_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'front_desk', 'staff')
  )
$$;

-- Create has_financial_access function if not exists
CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'accounting')
  )
$$;

-- Create has_hr_access function if not exists
CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'hr')
  )
$$;

-- ============================================================================
-- PART 6: INSERT DEFAULT ACCOUNT CATEGORIES
-- ============================================================================

INSERT INTO public.account_categories (name, type, account_code, description) VALUES
  ('Cash', 'asset', '1000', 'Cash on hand and in bank'),
  ('Accounts Receivable', 'asset', '1100', 'Money owed by customers'),
  ('Inventory', 'asset', '1200', 'Stock of goods'),
  ('Equipment', 'asset', '1300', 'Fixed assets - equipment'),
  ('Accounts Payable', 'liability', '2000', 'Money owed to suppliers'),
  ('Loans Payable', 'liability', '2100', 'Outstanding loans'),
  ('Owner''s Equity', 'equity', '3000', 'Owner''s investment'),
  ('Retained Earnings', 'equity', '3100', 'Accumulated profits'),
  ('Room Revenue', 'revenue', '4000', 'Income from room bookings'),
  ('Food & Beverage Revenue', 'revenue', '4100', 'Income from F&B sales'),
  ('Other Revenue', 'revenue', '4200', 'Miscellaneous income'),
  ('Salaries & Wages', 'expense', '5000', 'Employee compensation'),
  ('Utilities', 'expense', '5100', 'Electricity, water, gas'),
  ('Supplies', 'expense', '5200', 'Operating supplies'),
  ('Maintenance', 'expense', '5300', 'Repairs and maintenance'),
  ('Marketing', 'expense', '5400', 'Advertising and promotion'),
  ('Insurance', 'expense', '5500', 'Insurance expenses'),
  ('Depreciation', 'expense', '5600', 'Asset depreciation')
ON CONFLICT (account_code) DO NOTHING;

-- ============================================================================
-- PART 7: ADD UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_members_updated_at ON public.gym_members;
CREATE TRIGGER update_gym_members_updated_at
BEFORE UPDATE ON public.gym_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_equipment_updated_at ON public.gym_equipment;
CREATE TRIGGER update_gym_equipment_updated_at
BEFORE UPDATE ON public.gym_equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gym_trainers_updated_at ON public.gym_trainers;
CREATE TRIGGER update_gym_trainers_updated_at
BEFORE UPDATE ON public.gym_trainers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_categories_updated_at ON public.account_categories;
CREATE TRIGGER update_account_categories_updated_at
BEFORE UPDATE ON public.account_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify the migration
SELECT 
  'Orders & Order Items FK' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_order_id_fkey'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END as status
UNION ALL
SELECT 
  'Recipes Table',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'recipes' AND table_schema = 'public'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'Account Categories Table',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'account_categories' AND table_schema = 'public'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'Gym Members Table',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'gym_members' AND table_schema = 'public'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'Gym Trainer Bookings Table',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'gym_trainer_bookings' AND table_schema = 'public'
  ) THEN '✓ PASS' ELSE '✗ FAIL' END
UNION ALL
SELECT 
  'Helper Functions',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name IN ('has_hotel_staff_access', 'has_management_access', 'has_financial_access')
  ) THEN '✓ PASS' ELSE '✗ FAIL' END;
