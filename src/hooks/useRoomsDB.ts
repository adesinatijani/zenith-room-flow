import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  rate: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  capacity: number;
  amenities: string[];
  floor_number?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomBooking {
  id: string;
  room_id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  booking_status: 'active' | 'completed' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export const useRoomsDB = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');
      
      if (error) throw error;
      setRooms((data || []) as Room[]);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        variant: "destructive",
      });
    }
  };

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBookings((data || []) as RoomBooking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    }
  };

  // Create a room booking (check-in)
  const createRoomBooking = async (bookingData: {
    room_id: string;
    guest_name: string;
    guest_phone?: string;
    guest_email?: string;
    check_out_date: string;
    nights: number;
    total_amount: number;
    special_requests?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .insert([{
          ...bookingData,
          payment_status: 'paid',
          booking_status: 'active'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh data
      await Promise.all([fetchRooms(), fetchBookings()]);
      
      toast({
        title: "Check-in Successful",
        description: `${bookingData.guest_name} has been checked into room`,
      });
      
      return data as RoomBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create room booking",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get available rooms
  const getAvailableRooms = () => {
    return rooms.filter(room => room.status === 'available');
  };

  // Get room by number
  const getRoomByNumber = (roomNumber: string) => {
    return rooms.find(room => room.room_number === roomNumber);
  };

  // Create a new room
  const createRoom = async (roomData: {
    room_number: string;
    room_type: string;
    rate: number;
    floor_number?: number;
    capacity?: number;
    amenities?: string[];
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          ...roomData,
          status: 'available'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchRooms();
      
      toast({
        title: "Success",
        description: "Room added successfully",
      });
      
      return data as Room;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update a room
  const updateRoom = async (roomId: string, roomData: Partial<Room>) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ ...roomData, updated_at: new Date().toISOString() })
        .eq('id', roomId);
      
      if (error) throw error;
      
      await fetchRooms();
      
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update room status
  const updateRoomStatus = async (roomId: string, status: Room['status']) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', roomId);
      
      if (error) throw error;
      
      // Update local state
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, status } : room
      ));
    } catch (error) {
      console.error('Error updating room status:', error);
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      });
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, booking_status: RoomBooking['booking_status']) => {
    try {
      const { error } = await supabase
        .from('room_bookings')
        .update({ booking_status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Refresh data
      await Promise.all([fetchRooms(), fetchBookings()]);
      
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete a room
  const deleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
      
      await fetchRooms();
      
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchRooms(), fetchBookings()]);
      setLoading(false);
    };

    initializeData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const roomsChannel = supabase
      .channel('rooms-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' },
        () => fetchRooms()
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_bookings' },
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  return {
    rooms,
    bookings,
    loading,
    createRoom,
    updateRoom,
    deleteRoom,
    createRoomBooking,
    getAvailableRooms,
    getRoomByNumber,
    updateRoomStatus,
    updateBookingStatus,
    refreshData: () => Promise.all([fetchRooms(), fetchBookings()])
  };
};