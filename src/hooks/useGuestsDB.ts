import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nationality?: string;
  total_bookings: number;
  total_spent: number;
  loyalty_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'vip' | 'blacklisted';
  last_stay?: string;
  preferences: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useGuestsDB = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching guests",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setGuests(data as Guest[] || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchGuests();
      setLoading(false);
    };

    loadData();

    // Real-time subscription
    const guestsChannel = supabase
      .channel("guests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, fetchGuests)
      .subscribe();

    return () => {
      supabase.removeChannel(guestsChannel);
    };
  }, []);

  const addGuest = async (guestData: Omit<Guest, "id" | "created_at" | "updated_at" | "total_bookings" | "total_spent">) => {
    const { error } = await supabase.from("guests").insert([guestData]);

    if (error) {
      toast({
        title: "Error adding guest",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Guest added successfully" });
  };

  const updateGuest = async (id: string, guestData: Partial<Guest>) => {
    const { error } = await supabase
      .from("guests")
      .update(guestData)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating guest",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Guest updated successfully" });
  };

  const deleteGuest = async (id: string) => {
    const { error } = await supabase
      .from("guests")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting guest",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Guest deleted successfully" });
  };

  const getGuestById = (id: string) => {
    return guests.find(g => g.id === id);
  };

  const getGuestByName = (name: string) => {
    return guests.find(g => g.name.toLowerCase() === name.toLowerCase());
  };

  const getAvailableGuests = () => {
    return guests.filter(g => g.status !== 'blacklisted');
  };

  return {
    guests,
    loading,
    addGuest,
    updateGuest,
    deleteGuest,
    getGuestById,
    getGuestByName,
    getAvailableGuests,
  };
};
