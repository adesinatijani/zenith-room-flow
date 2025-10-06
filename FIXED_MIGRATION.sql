-- SIMPLIFIED MIGRATION FOR EXISTING DATABASE
-- This migration safely adds missing tables and fixes constraints
-- Safe to run on databases that already have account_categories

-- ============================================================================
-- PART 1: Fix orders table constraints and relationships
-- ============================================================================

-- Drop old constraints if they exist
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_guest_type_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add correct constraints for orders
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_guest_type_check 
  CHECK (guest_type IN ('walk-in', 'hotel-guest'));

ALTER TABLE public.orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('active', 'paid', 'cancelled'));

-- Add foreign key from order_items to orders if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'order_items_order_id_fkey' 
    AND table_name = 'order_items'
  ) THEN
    ALTER TABLE public.order_items 
      ADD CONSTRAINT order_items_order_id_fkey 
      FOREIGN KEY (order_id) 
      REFERENCES public.orders(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- PART 2: Create recipes table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  prep_time INTEGER NOT NULL DEFAULT 0,
  cook_time INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  cost NUMERIC NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for recipes
DROP POLICY IF EXISTS "Staff can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Staff can insert recipes" ON public.recipes;
DROP POLICY IF EXISTS "Staff can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Management can delete recipes" ON public.recipes;

CREATE POLICY "Staff can view recipes" ON public.recipes FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "Staff can insert recipes" ON public.recipes FOR INSERT WITH CHECK (has_hotel_staff_access());
CREATE POLICY "Staff can update recipes" ON public.recipes FOR UPDATE USING (has_hotel_staff_access());
CREATE POLICY "Management can delete recipes" ON public.recipes FOR DELETE USING (has_management_access());

-- ============================================================================
-- PART 3: Create gym_members table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gym_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('monthly', 'quarterly', 'annual', 'day-pass')),
  membership_start DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Management can manage gym members" ON public.gym_members;
DROP POLICY IF EXISTS "Staff can view gym members" ON public.gym_members;

CREATE POLICY "Management can manage gym members" ON public.gym_members FOR ALL USING (has_management_access());
CREATE POLICY "Staff can view gym members" ON public.gym_members FOR SELECT USING (has_hotel_staff_access());

-- ============================================================================
-- PART 4: Create gym_equipment table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gym_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'out-of-order')),
  location TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiration DATE,
  last_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Management can manage gym equipment" ON public.gym_equipment;
DROP POLICY IF EXISTS "Staff can view gym equipment" ON public.gym_equipment;

CREATE POLICY "Management can manage gym equipment" ON public.gym_equipment FOR ALL USING (has_management_access());
CREATE POLICY "Staff can view gym equipment" ON public.gym_equipment FOR SELECT USING (has_hotel_staff_access());

-- ============================================================================
-- PART 5: Create gym_trainers table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gym_trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate NUMERIC NOT NULL,
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'off-duty')),
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Management can manage gym trainers" ON public.gym_trainers;
DROP POLICY IF EXISTS "Staff can view gym trainers" ON public.gym_trainers;

CREATE POLICY "Management can manage gym trainers" ON public.gym_trainers FOR ALL USING (has_management_access());
CREATE POLICY "Staff can view gym trainers" ON public.gym_trainers FOR SELECT USING (has_hotel_staff_access());

-- ============================================================================
-- PART 6: Create gym_trainer_bookings table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gym_trainer_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.gym_trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_trainer_bookings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Management can manage trainer bookings" ON public.gym_trainer_bookings;
DROP POLICY IF EXISTS "Staff can view trainer bookings" ON public.gym_trainer_bookings;
DROP POLICY IF EXISTS "Staff can create trainer bookings" ON public.gym_trainer_bookings;

CREATE POLICY "Management can manage trainer bookings" ON public.gym_trainer_bookings FOR ALL USING (has_management_access());
CREATE POLICY "Staff can view trainer bookings" ON public.gym_trainer_bookings FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "Staff can create trainer bookings" ON public.gym_trainer_bookings FOR INSERT WITH CHECK (has_hotel_staff_access());

-- ============================================================================
-- PART 7: Ensure helper functions exist
-- ============================================================================

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

-- ============================================================================
-- PART 8: Add updated_at triggers for new tables
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers only if tables exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes') THEN
    DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
    CREATE TRIGGER update_recipes_updated_at
      BEFORE UPDATE ON public.recipes
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gym_members') THEN
    DROP TRIGGER IF EXISTS update_gym_members_updated_at ON public.gym_members;
    CREATE TRIGGER update_gym_members_updated_at
      BEFORE UPDATE ON public.gym_members
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gym_equipment') THEN
    DROP TRIGGER IF EXISTS update_gym_equipment_updated_at ON public.gym_equipment;
    CREATE TRIGGER update_gym_equipment_updated_at
      BEFORE UPDATE ON public.gym_equipment
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gym_trainers') THEN
    DROP TRIGGER IF EXISTS update_gym_trainers_updated_at ON public.gym_trainers;
    CREATE TRIGGER update_gym_trainers_updated_at
      BEFORE UPDATE ON public.gym_trainers
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Migration completed successfully!' AS status;
