import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface RestaurantTable {
  id: string;
  table_number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  created_at: string;
  updated_at: string;
}

export const useRestaurantTables = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');

      if (error) throw error;
      setTables((data || []) as RestaurantTable[]);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to load tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTable = async (tableNumber: string, seats: number = 4) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .insert([{
          table_number: tableNumber,
          seats,
          status: 'available'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTables(prev => [...prev, data as RestaurantTable]);
      toast({
        title: "Success",
        description: `Table ${tableNumber} added successfully`,
      });
      
      return data;
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: "Error",
        description: "Failed to add table",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTableStatus = async (tableId: string, status: RestaurantTable['status']) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .update({ status })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;

      setTables(prev => prev.map(table => 
        table.id === tableId ? { ...table, status } : table
      ));

      return data;
    } catch (error) {
      console.error('Error updating table status:', error);
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTable = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;

      setTables(prev => prev.filter(table => table.id !== tableId));
      
      toast({
        title: "Success",
        description: "Table deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        title: "Error",
        description: "Failed to delete table",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTables();

    // Set up real-time subscription for tables
    const channel = supabase
      .channel('restaurant_tables_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_tables'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTables(prev => [...prev, payload.new as RestaurantTable]);
          } else if (payload.eventType === 'UPDATE') {
            setTables(prev => prev.map(table => 
              table.id === payload.new.id ? payload.new as RestaurantTable : table
            ));
          } else if (payload.eventType === 'DELETE') {
            setTables(prev => prev.filter(table => table.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tables,
    loading,
    addTable,
    updateTableStatus,
    deleteTable,
    refetch: fetchTables
  };
};