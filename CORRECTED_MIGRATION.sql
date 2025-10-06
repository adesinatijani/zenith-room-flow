-- =====================================================
-- CORRECTED DATABASE MIGRATION SCRIPT
-- Fixes: Orders constraints, account_categories, missing tables
-- =====================================================

-- =====================================================
-- PART 1: FIX ORDERS TABLE CONSTRAINTS
-- =====================================================

-- Fix any invalid data in orders table first
UPDATE public.orders 
SET guest_type = 'table' 
WHERE guest_type NOT IN ('room', 'table', 'standalone');

UPDATE public.orders 
SET status = 'active' 
WHERE status NOT IN ('active', 'paid', 'cancelled');

-- Drop old constraints if they exist
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_guest_type_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add correct constraints
ALTER TABLE public.orders 
ADD CONSTRAINT orders_guest_type_check 
CHECK (guest_type IN ('room', 'table', 'standalone'));

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('active', 'paid', 'cancelled'));

-- =====================================================
-- PART 2: FIX ORDER_ITEMS FOREIGN KEY
-- =====================================================

-- Drop existing foreign key if it exists
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

-- Add foreign key with CASCADE delete
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.orders(id) 
ON DELETE CASCADE;

-- =====================================================
-- PART 3: FIX ACCOUNT_CATEGORIES TABLE
-- =====================================================

-- Add UNIQUE constraint on account_code if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'account_categories_account_code_key'
  ) THEN
    ALTER TABLE public.account_categories 
    ADD CONSTRAINT account_categories_account_code_key 
    UNIQUE (account_code);
  END IF;
END $$;

-- Make account_code NOT NULL (only if no NULL values exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.account_categories WHERE account_code IS NULL
  ) THEN
    ALTER TABLE public.account_categories 
    ALTER COLUMN account_code SET NOT NULL;
  END IF;
END $$;

-- Add foreign key constraints to other tables if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'account_entries_category_id_fkey'
  ) THEN
    ALTER TABLE public.account_entries 
    ADD CONSTRAINT account_entries_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES public.account_categories(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'budgets_category_id_fkey'
  ) THEN
    ALTER TABLE public.budgets 
    ADD CONSTRAINT budgets_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES public.account_categories(id);
  END IF;
END $$;

-- =====================================================
-- PART 4: CREATE RECIPES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  prep_time INTEGER NOT NULL,
  cook_time INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view recipes" ON public.recipes;
CREATE POLICY "Staff can view recipes" 
ON public.recipes FOR SELECT 
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage recipes" ON public.recipes;
CREATE POLICY "Management can manage recipes" 
ON public.recipes FOR ALL 
USING (has_management_access()) 
WITH CHECK (has_management_access());

-- =====================================================
-- PART 5: CREATE GYM TABLES
-- =====================================================

-- Gym Members
CREATE TABLE IF NOT EXISTS public.gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  membership_type TEXT NOT NULL,
  membership_start DATE NOT NULL,
  membership_end DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  check_ins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view gym members" ON public.gym_members;
CREATE POLICY "Staff can view gym members" 
ON public.gym_members FOR SELECT 
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage gym members" ON public.gym_members;
CREATE POLICY "Management can manage gym members" 
ON public.gym_members FOR ALL 
USING (has_management_access()) 
WITH CHECK (has_management_access());

-- Gym Equipment
CREATE TABLE IF NOT EXISTS public.gym_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'broken')),
  location TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiration DATE,
  last_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view gym equipment" ON public.gym_equipment;
CREATE POLICY "Staff can view gym equipment" 
ON public.gym_equipment FOR SELECT 
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage gym equipment" ON public.gym_equipment;
CREATE POLICY "Management can manage gym equipment" 
ON public.gym_equipment FOR ALL 
USING (has_management_access()) 
WITH CHECK (has_management_access());

-- Gym Trainers
CREATE TABLE IF NOT EXISTS public.gym_trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate NUMERIC NOT NULL,
  availability TEXT DEFAULT 'available',
  rating NUMERIC DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view gym trainers" ON public.gym_trainers;
CREATE POLICY "Staff can view gym trainers" 
ON public.gym_trainers FOR SELECT 
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage gym trainers" ON public.gym_trainers;
CREATE POLICY "Management can manage gym trainers" 
ON public.gym_trainers FOR ALL 
USING (has_management_access()) 
WITH CHECK (has_management_access());

-- Gym Trainer Bookings
CREATE TABLE IF NOT EXISTS public.gym_trainer_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.gym_trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.gym_trainer_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view trainer bookings" ON public.gym_trainer_bookings;
CREATE POLICY "Staff can view trainer bookings" 
ON public.gym_trainer_bookings FOR SELECT 
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage trainer bookings" ON public.gym_trainer_bookings;
CREATE POLICY "Management can manage trainer bookings" 
ON public.gym_trainer_bookings FOR ALL 
USING (has_management_access()) 
WITH CHECK (has_management_access());

-- =====================================================
-- PART 6: ENSURE HELPER FUNCTIONS EXIST
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_management_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_kitchen_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'kitchen', 'staff');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_booking_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'accounting', 'hr');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'hr', 'manager');
END;
$$;

-- =====================================================
-- PART 7: INSERT DEFAULT ACCOUNT CATEGORIES
-- =====================================================

INSERT INTO public.account_categories (name, type, account_code, description) VALUES
  ('Room Revenue', 'revenue', 'REV-001', 'Revenue from room bookings'),
  ('Food & Beverage Revenue', 'revenue', 'REV-002', 'Revenue from restaurant and bar'),
  ('Hall Rental Revenue', 'revenue', 'REV-003', 'Revenue from event hall rentals'),
  ('Other Revenue', 'revenue', 'REV-004', 'Miscellaneous revenue'),
  ('Salaries & Wages', 'expense', 'EXP-001', 'Employee salaries and wages'),
  ('Utilities', 'expense', 'EXP-002', 'Water, electricity, internet'),
  ('Food & Beverage Costs', 'expense', 'EXP-003', 'Cost of food and beverages'),
  ('Maintenance & Repairs', 'expense', 'EXP-004', 'Building and equipment maintenance'),
  ('Marketing & Advertising', 'expense', 'EXP-005', 'Marketing expenses'),
  ('Supplies', 'expense', 'EXP-006', 'Operating supplies'),
  ('Insurance', 'expense', 'EXP-007', 'Insurance premiums'),
  ('Rent', 'expense', 'EXP-008', 'Property rent'),
  ('Cash', 'asset', 'AST-001', 'Cash in hand and bank'),
  ('Accounts Receivable', 'asset', 'AST-002', 'Money owed by customers'),
  ('Inventory', 'asset', 'AST-003', 'Stock and inventory'),
  ('Property & Equipment', 'asset', 'AST-004', 'Fixed assets'),
  ('Accounts Payable', 'liability', 'LIA-001', 'Money owed to suppliers'),
  ('Loans Payable', 'liability', 'LIA-002', 'Outstanding loans'),
  ('Accrued Expenses', 'liability', 'LIA-003', 'Expenses incurred but not paid'),
  ('Owner Equity', 'equity', 'EQT-001', 'Owner''s investment'),
  ('Retained Earnings', 'equity', 'EQT-002', 'Accumulated profits'),
  ('Bank Charges', 'expense', 'EXP-009', 'Banking fees and charges'),
  ('Depreciation', 'expense', 'EXP-010', 'Asset depreciation'),
  ('Professional Fees', 'expense', 'EXP-011', 'Legal, accounting fees'),
  ('Training & Development', 'expense', 'EXP-012', 'Employee training costs')
ON CONFLICT (account_code) DO NOTHING;

-- =====================================================
-- PART 8: ADD UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

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

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
