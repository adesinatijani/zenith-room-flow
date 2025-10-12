import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDailyStats = () => {
  return useQuery({
    queryKey: ['daily-stats'],
    queryFn: async () => {
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Fetch today's bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('room_bookings')
        .select('*')
        .gte('created_at', todayStr)
        .eq('payment_status', 'paid');

      if (bookingsError) throw bookingsError;

      // Fetch today's orders (restaurant/bar)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', todayStr)
        .eq('status', 'paid');

      if (ordersError) throw ordersError;

      // Fetch today's gym sessions
      const { data: gymSessions, error: gymError } = await supabase
        .from('game_sessions')
        .select('*')
        .gte('created_at', todayStr)
        .eq('payment_status', 'paid');

      if (gymError) throw gymError;

      // Calculate revenues
      const bookingRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
      const ordersRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const gymRevenue = gymSessions?.reduce((sum, g) => sum + Number(g.total_amount), 0) || 0;

      return {
        bookingRevenue,
        ordersRevenue,
        gymRevenue,
        totalRevenue: bookingRevenue + ordersRevenue + gymRevenue,
        bookingCount: bookings?.length || 0,
        ordersCount: orders?.length || 0,
        gymSessionsCount: gymSessions?.length || 0,
      };
    },
    refetchInterval: 60000, // Refetch every minute to keep data fresh
  });
};
