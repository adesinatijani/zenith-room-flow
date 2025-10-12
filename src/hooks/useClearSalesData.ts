import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useClearSalesData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Delete all paid orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('status', 'paid');

      if (ordersError) throw ordersError;

      // Delete all order items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (orderItemsError) throw orderItemsError;

      // Delete all paid gym/game sessions
      const { error: gymError } = await supabase
        .from('game_sessions')
        .delete()
        .eq('payment_status', 'paid');

      if (gymError) throw gymError;

      // Update all room bookings to cancelled (don't delete to preserve history)
      const { error: bookingsError } = await supabase
        .from('room_bookings')
        .update({ booking_status: 'cancelled' })
        .eq('payment_status', 'paid');

      if (bookingsError) throw bookingsError;

      // Delete all account entries (accounting data) - this will reset accounting module to zero
      const { error: accountEntriesError } = await supabase
        .from('account_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (accountEntriesError) throw accountEntriesError;

      // Note: Categories and budgets are preserved as they are configuration data
      // Only transaction data (account_entries) is cleared

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['room-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['game-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['account-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      
      toast({
        title: "Sales Data Cleared",
        description: "All sales data has been successfully cleared from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear sales data. Please try again.",
        variant: "destructive",
      });
      console.error("Error clearing sales data:", error);
    },
  });
};
