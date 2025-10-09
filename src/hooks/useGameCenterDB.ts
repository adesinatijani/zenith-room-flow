import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createAccountingEntryForPayment } from "@/utils/accountingIntegration";

export interface GameStation {
  id: string;
  station_name: string;
  station_number: string;
  game_type: string;
  hourly_rate: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  current_session_id?: string;
  equipment_specs?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  station_id: string;
  player_name: string;
  player_phone?: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  hourly_rate: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface GameTournament {
  id: string;
  tournament_name: string;
  game_type: string;
  tournament_date: string;
  start_time: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
  description?: string;
  rules?: string;
  created_at: string;
  updated_at: string;
}

export interface GameBooking {
  id: string;
  station_id: string;
  player_name: string;
  player_phone: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export const useGameCenterDB = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<GameStation[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [tournaments, setTournaments] = useState<GameTournament[]>([]);
  const [bookings, setBookings] = useState<GameBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch game stations
  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('game_stations')
        .select('*')
        .order('station_number');

      if (error) throw error;
      setStations((data || []) as GameStation[]);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast({
        title: "Error",
        description: "Failed to load game stations",
        variant: "destructive"
      });
    }
  };

  // Fetch game sessions
  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions((data || []) as GameSession[]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Fetch tournaments
  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('game_tournaments')
        .select('*')
        .order('tournament_date', { ascending: false });

      if (error) throw error;
      setTournaments((data || []) as GameTournament[]);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('game_bookings')
        .select('*')
        .order('booking_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setBookings((data || []) as GameBooking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStations(),
        fetchSessions(),
        fetchTournaments(),
        fetchBookings()
      ]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions
    const stationsSubscription = supabase
      .channel('game_stations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_stations' }, fetchStations)
      .subscribe();

    const sessionsSubscription = supabase
      .channel('game_sessions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions' }, fetchSessions)
      .subscribe();

    const tournamentsSubscription = supabase
      .channel('game_tournaments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_tournaments' }, fetchTournaments)
      .subscribe();

    const bookingsSubscription = supabase
      .channel('game_bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_bookings' }, fetchBookings)
      .subscribe();

    return () => {
      stationsSubscription.unsubscribe();
      sessionsSubscription.unsubscribe();
      tournamentsSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
    };
  }, []);

  // Add game station
  const addStation = async (stationData: Omit<GameStation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('game_stations')
        .insert([stationData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Game station added successfully"
      });

      return data;
    } catch (error) {
      console.error('Error adding station:', error);
      toast({
        title: "Error",
        description: "Failed to add game station",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Start game session
  const startSession = async (sessionData: Omit<GameSession, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      // Update station status to occupied
      await supabase
        .from('game_stations')
        .update({ 
          status: 'occupied',
          current_session_id: data.id
        })
        .eq('id', sessionData.station_id);

      toast({
        title: "Success",
        description: "Gaming session started"
      });

      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start gaming session",
        variant: "destructive"
      });
      throw error;
    }
  };

  // End game session with payment
  const endSession = async (sessionId: string, paymentMethod: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      const endTime = new Date().toISOString();
      const startTime = new Date(session.start_time);
      const durationHours = (new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const totalAmount = durationHours * session.hourly_rate;

      // Update session
      const { error: sessionError } = await supabase
        .from('game_sessions')
        .update({
          end_time: endTime,
          duration_hours: durationHours,
          total_amount: totalAmount,
          payment_status: 'paid',
          payment_method: paymentMethod,
          status: 'completed'
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Update station status
      await supabase
        .from('game_stations')
        .update({ 
          status: 'available',
          current_session_id: null
        })
        .eq('id', session.station_id);

      // Create accounting entry
      await createAccountingEntryForPayment({
        amount: totalAmount,
        description: `Gaming session - Station ${session.station_id}`,
        source_type: 'game_session',
        source_id: sessionId,
        reference_number: `GAME-${sessionId.slice(0, 8)}`,
        payment_method: paymentMethod,
        guest_name: session.player_name
      });

      toast({
        title: "Success",
        description: `Session ended. Total: ${totalAmount.toFixed(2)}`
      });

      return { durationHours, totalAmount };
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Create tournament
  const createTournament = async (tournamentData: Omit<GameTournament, 'id' | 'created_at' | 'updated_at' | 'current_participants'>) => {
    try {
      const { data, error } = await supabase
        .from('game_tournaments')
        .insert([{ ...tournamentData, current_participants: 0 }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tournament created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: "Failed to create tournament",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Create booking
  const createBooking = async (bookingData: Omit<GameBooking, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('game_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      // If paid, create accounting entry
      if (bookingData.payment_status === 'paid') {
        await createAccountingEntryForPayment({
          amount: bookingData.total_amount,
          description: `Game booking - ${bookingData.player_name}`,
          source_type: 'pos_order',
          source_id: data.id,
          reference_number: `BOOKING-${data.id.slice(0, 8)}`,
          payment_method: 'prepaid',
          guest_name: bookingData.player_name
        });
      }

      toast({
        title: "Success",
        description: "Booking created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update station status
  const updateStationStatus = async (stationId: string, status: GameStation['status']) => {
    try {
      const { error } = await supabase
        .from('game_stations')
        .update({ status })
        .eq('id', stationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Station status updated"
      });
    } catch (error) {
      console.error('Error updating station:', error);
      toast({
        title: "Error",
        description: "Failed to update station status",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update station (add before return)
  const updateStation = async (id: string, stationData: Partial<GameStation>) => {
    try {
      const { error } = await supabase
        .from('game_stations')
        .update(stationData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Game station updated successfully"
      });
    } catch (error) {
      console.error('Error updating station:', error);
      toast({
        title: "Error",
        description: "Failed to update game station",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    stations,
    sessions,
    tournaments,
    bookings,
    loading,
    addStation,
    updateStation,
    startSession,
    endSession,
    createTournament,
    createBooking,
    updateStationStatus
  };
};