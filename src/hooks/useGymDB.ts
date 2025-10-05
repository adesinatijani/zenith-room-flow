import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GymMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membership_type: 'day-pass' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'suspended';
  check_ins: number;
  created_at: string;
  updated_at: string;
}

export interface GymEquipment {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in-use' | 'maintenance';
  location?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiration?: string;
  last_maintenance?: string;
  created_at: string;
  updated_at: string;
}

export interface GymTrainer {
  id: string;
  name: string;
  specialization: string[];
  hourly_rate: number;
  availability: 'available' | 'busy' | 'off-duty';
  rating: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
}

export interface TrainerBooking {
  id: string;
  trainer_id: string;
  member_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export const useGymDB = () => {
  const [members, setMembers] = useState<GymMember[]>([]);
  const [equipment, setEquipment] = useState<GymEquipment[]>([]);
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [trainerBookings, setTrainerBookings] = useState<TrainerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("gym_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching members",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMembers(data as GymMember[] || []);
  };

  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from("gym_equipment")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error fetching equipment",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEquipment(data as GymEquipment[] || []);
  };

  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from("gym_trainers")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error fetching trainers",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTrainers(data as GymTrainer[] || []);
  };

  const fetchTrainerBookings = async () => {
    const { data, error } = await supabase
      .from("gym_trainer_bookings")
      .select("*")
      .order("session_date", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTrainerBookings(data as TrainerBooking[] || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMembers(),
        fetchEquipment(),
        fetchTrainers(),
        fetchTrainerBookings(),
      ]);
      setLoading(false);
    };

    loadData();

    // Real-time subscriptions
    const membersChannel = supabase
      .channel("gym_members_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "gym_members" }, fetchMembers)
      .subscribe();

    const equipmentChannel = supabase
      .channel("gym_equipment_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "gym_equipment" }, fetchEquipment)
      .subscribe();

    const trainersChannel = supabase
      .channel("gym_trainers_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "gym_trainers" }, fetchTrainers)
      .subscribe();

    const bookingsChannel = supabase
      .channel("gym_trainer_bookings_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "gym_trainer_bookings" }, fetchTrainerBookings)
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(equipmentChannel);
      supabase.removeChannel(trainersChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const addMember = async (memberData: Omit<GymMember, "id" | "created_at" | "updated_at" | "check_ins">) => {
    const { error } = await supabase.from("gym_members").insert([memberData]);

    if (error) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Member added successfully" });
  };

  const updateMember = async (id: string, memberData: Partial<GymMember>) => {
    const { error } = await supabase
      .from("gym_members")
      .update(memberData)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Member updated successfully" });
  };

  const checkInMember = async (memberId: string) => {
    const { error } = await supabase
      .from("gym_member_checkins")
      .insert([{ member_id: memberId }]);

    if (error) {
      toast({
        title: "Error checking in member",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    // Increment check_ins count
    const member = members.find(m => m.id === memberId);
    if (member) {
      await updateMember(memberId, { check_ins: member.check_ins + 1 });
    }

    toast({ title: "Member checked in successfully" });
  };

  const addEquipment = async (equipmentData: Omit<GymEquipment, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("gym_equipment").insert([equipmentData]);

    if (error) {
      toast({
        title: "Error adding equipment",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Equipment added successfully" });
  };

  const updateEquipmentStatus = async (id: string, status: GymEquipment["status"]) => {
    const { error } = await supabase
      .from("gym_equipment")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating equipment status",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Equipment status updated" });
  };

  const addTrainer = async (trainerData: Omit<GymTrainer, "id" | "created_at" | "updated_at" | "total_sessions" | "rating">) => {
    const { error } = await supabase.from("gym_trainers").insert([trainerData]);

    if (error) {
      toast({
        title: "Error adding trainer",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Trainer added successfully" });
  };

  const bookTrainerSession = async (bookingData: Omit<TrainerBooking, "id" | "created_at">) => {
    const { error } = await supabase.from("gym_trainer_bookings").insert([bookingData]);

    if (error) {
      toast({
        title: "Error booking trainer session",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Trainer session booked successfully" });
  };

  return {
    members,
    equipment,
    trainers,
    trainerBookings,
    loading,
    addMember,
    updateMember,
    checkInMember,
    addEquipment,
    updateEquipmentStatus,
    addTrainer,
    bookTrainerSession,
  };
};
