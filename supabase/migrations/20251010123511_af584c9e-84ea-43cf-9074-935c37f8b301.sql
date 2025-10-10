-- Create guests table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  nationality TEXT,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  loyalty_tier TEXT NOT NULL DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vip', 'blacklisted')),
  last_stay DATE,
  preferences TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone);

-- Enable Row Level Security
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view guests" ON public.guests;
DROP POLICY IF EXISTS "Staff can add guests" ON public.guests;
DROP POLICY IF EXISTS "Staff can update guests" ON public.guests;
DROP POLICY IF EXISTS "Management can delete guests" ON public.guests;

-- RLS Policies for guests table
CREATE POLICY "Staff can view guests"
  ON public.guests
  FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Staff can add guests"
  ON public.guests
  FOR INSERT
  WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Staff can update guests"
  ON public.guests
  FOR UPDATE
  USING (has_hotel_staff_access())
  WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Management can delete guests"
  ON public.guests
  FOR DELETE
  USING (has_management_access());