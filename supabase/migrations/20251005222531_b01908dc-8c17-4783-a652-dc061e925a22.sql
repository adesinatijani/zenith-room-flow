-- Phase 2 & 3: Create all required tables with RLS policies

-- ============================================
-- GYM MANAGEMENT TABLES
-- ============================================

-- Gym Members Table
CREATE TABLE public.gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  membership_type TEXT CHECK (membership_type IN ('day-pass', 'monthly', 'yearly')) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'suspended')) DEFAULT 'active',
  check_ins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view gym members"
ON public.gym_members FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Management can insert gym members"
ON public.gym_members FOR INSERT
TO authenticated
WITH CHECK (has_management_access());

CREATE POLICY "Management can update gym members"
ON public.gym_members FOR UPDATE
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

CREATE POLICY "Admin can delete gym members"
ON public.gym_members FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Gym Equipment Table
CREATE TABLE public.gym_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'in-use', 'maintenance')) DEFAULT 'available',
  location TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiration DATE,
  last_maintenance DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view gym equipment"
ON public.gym_equipment FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Management can manage gym equipment"
ON public.gym_equipment FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Gym Trainers Table
CREATE TABLE public.gym_trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate NUMERIC NOT NULL,
  availability TEXT CHECK (availability IN ('available', 'busy', 'off-duty')) DEFAULT 'available',
  rating NUMERIC CHECK (rating >= 0 AND rating <= 5) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view gym trainers"
ON public.gym_trainers FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Management can manage gym trainers"
ON public.gym_trainers FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Gym Member Check-ins Table
CREATE TABLE public.gym_member_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.gym_members(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMPTZ DEFAULT now(),
  check_out_time TIMESTAMPTZ
);

ALTER TABLE public.gym_member_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view checkins"
ON public.gym_member_checkins FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Staff can create checkins"
ON public.gym_member_checkins FOR INSERT
TO authenticated
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can update checkins"
ON public.gym_member_checkins FOR UPDATE
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- Gym Trainer Bookings Table
CREATE TABLE public.gym_trainer_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.gym_trainers(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.gym_members(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_trainer_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view trainer bookings"
ON public.gym_trainer_bookings FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Staff can create trainer bookings"
ON public.gym_trainer_bookings FOR INSERT
TO authenticated
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can update trainer bookings"
ON public.gym_trainer_bookings FOR UPDATE
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- ============================================
-- HALL MANAGEMENT TABLES
-- ============================================

-- Halls Table
CREATE TABLE public.halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  location TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  availability TEXT CHECK (availability IN ('available', 'booked', 'maintenance')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view halls"
ON public.halls FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Management can manage halls"
ON public.halls FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Hall Bookings Table
CREATE TABLE public.hall_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  guest_id UUID,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  number_of_guests INTEGER,
  total_amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hall_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view hall bookings"
ON public.hall_bookings FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Staff can create hall bookings"
ON public.hall_bookings FOR INSERT
TO authenticated
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can update hall bookings"
ON public.hall_bookings FOR UPDATE
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Management can delete hall bookings"
ON public.hall_bookings FOR DELETE
TO authenticated
USING (has_management_access());

-- ============================================
-- GUEST MANAGEMENT TABLE
-- ============================================

CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  nationality TEXT,
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  loyalty_tier TEXT CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')) DEFAULT 'Bronze',
  status TEXT CHECK (status IN ('active', 'vip', 'blacklisted')) DEFAULT 'active',
  last_stay DATE,
  preferences TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view guests"
ON public.guests FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "Staff can create guests"
ON public.guests FOR INSERT
TO authenticated
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can update guests"
ON public.guests FOR UPDATE
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Admin can delete guests"
ON public.guests FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- RECIPE MANAGEMENT TABLE
-- ============================================

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  prep_time INTEGER NOT NULL,
  cook_time INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  cost NUMERIC NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kitchen staff can view recipes"
ON public.recipes FOR SELECT
TO authenticated
USING (has_kitchen_access());

CREATE POLICY "Kitchen staff can create recipes"
ON public.recipes FOR INSERT
TO authenticated
WITH CHECK (has_kitchen_access());

CREATE POLICY "Kitchen staff can update recipes"
ON public.recipes FOR UPDATE
TO authenticated
USING (has_kitchen_access())
WITH CHECK (has_kitchen_access());

CREATE POLICY "Management can delete recipes"
ON public.recipes FOR DELETE
TO authenticated
USING (has_management_access());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_gym_members_updated_at
BEFORE UPDATE ON public.gym_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gym_equipment_updated_at
BEFORE UPDATE ON public.gym_equipment
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gym_trainers_updated_at
BEFORE UPDATE ON public.gym_trainers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_halls_updated_at
BEFORE UPDATE ON public.halls
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hall_bookings_updated_at
BEFORE UPDATE ON public.hall_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();