-- Create game_stations table
CREATE TABLE IF NOT EXISTS public.game_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name TEXT NOT NULL,
  station_number TEXT NOT NULL UNIQUE,
  game_type TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  current_session_id UUID,
  equipment_specs TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES public.game_stations(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_phone TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration_hours NUMERIC,
  hourly_rate NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create game_tournaments table
CREATE TABLE IF NOT EXISTS public.game_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_name TEXT NOT NULL,
  game_type TEXT NOT NULL,
  tournament_date DATE NOT NULL,
  start_time TIME NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 16,
  current_participants INTEGER NOT NULL DEFAULT 0,
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  prize_pool NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  rules TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create game_bookings table
CREATE TABLE IF NOT EXISTS public.game_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES public.game_stations(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create housekeeping_tasks table
CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('cleaning', 'maintenance', 'inspection', 'laundry', 'amenities_restock')),
  assigned_to UUID,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  notes TEXT,
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create inventory_issuances table
CREATE TABLE IF NOT EXISTS public.inventory_issuances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  quantity_issued INTEGER NOT NULL,
  issued_to TEXT NOT NULL,
  department TEXT,
  room_number TEXT,
  purpose TEXT NOT NULL,
  issued_by UUID,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'damaged', 'lost')),
  notes TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_issuances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_stations
CREATE POLICY "Staff can view game stations"
  ON public.game_stations FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Management can manage game stations"
  ON public.game_stations FOR ALL
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- RLS Policies for game_sessions
CREATE POLICY "Staff can view game sessions"
  ON public.game_sessions FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Staff can manage game sessions"
  ON public.game_sessions FOR ALL
  USING (has_hotel_staff_access())
  WITH CHECK (has_hotel_staff_access());

-- RLS Policies for game_tournaments
CREATE POLICY "Anyone can view tournaments"
  ON public.game_tournaments FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage tournaments"
  ON public.game_tournaments FOR ALL
  USING (has_hotel_staff_access())
  WITH CHECK (has_hotel_staff_access());

-- RLS Policies for game_bookings
CREATE POLICY "Staff can view game bookings"
  ON public.game_bookings FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Staff can manage game bookings"
  ON public.game_bookings FOR ALL
  USING (has_hotel_staff_access())
  WITH CHECK (has_hotel_staff_access());

-- RLS Policies for housekeeping_tasks
CREATE POLICY "Staff can view housekeeping tasks"
  ON public.housekeeping_tasks FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Housekeeping can manage tasks"
  ON public.housekeeping_tasks FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'housekeeping'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'housekeeping'));

-- RLS Policies for inventory_issuances
CREATE POLICY "Staff can view inventory issuances"
  ON public.inventory_issuances FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Staff can create inventory issuances"
  ON public.inventory_issuances FOR INSERT
  WITH CHECK (has_hotel_staff_access());

CREATE POLICY "Management can update inventory issuances"
  ON public.inventory_issuances FOR UPDATE
  USING (has_management_access())
  WITH CHECK (has_management_access());

-- Triggers for updated_at
CREATE TRIGGER update_game_stations_updated_at
  BEFORE UPDATE ON public.game_stations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_tournaments_updated_at
  BEFORE UPDATE ON public.game_tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_bookings_updated_at
  BEFORE UPDATE ON public.game_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_housekeeping_tasks_updated_at
  BEFORE UPDATE ON public.housekeeping_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_game_sessions_station ON public.game_sessions(station_id);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX idx_game_bookings_station ON public.game_bookings(station_id);
CREATE INDEX idx_game_bookings_date ON public.game_bookings(booking_date);
CREATE INDEX idx_housekeeping_tasks_room ON public.housekeeping_tasks(room_id);
CREATE INDEX idx_housekeeping_tasks_status ON public.housekeeping_tasks(status);
CREATE INDEX idx_inventory_issuances_item ON public.inventory_issuances(inventory_item_id);