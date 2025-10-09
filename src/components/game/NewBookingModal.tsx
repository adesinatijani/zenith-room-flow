import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { useGameCenterDB } from "@/hooks/useGameCenterDB";
import AddGuestModal from "@/components/guest/AddGuestModal";

interface NewBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookingFormData {
  guestId: string;
  playerName: string;
  playerPhone: string;
  stationId: string;
  duration: number;
  startTime: string;
  specialRequests: string;
}

const NewBookingModal = ({ open, onOpenChange }: NewBookingModalProps) => {
  const { formatCurrency } = useGlobalSettings();
  const { guests } = useGuestsDB();
  const { stations, createBooking } = useGameCenterDB();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);

  const form = useForm<BookingFormData>({
    defaultValues: {
      guestId: "",
      playerName: "",
      playerPhone: "",
      stationId: "",
      duration: 60,
      startTime: "",
      specialRequests: "",
    },
  });

  const availableStations = stations.filter(s => s.status === "available");
  const selectedStation = availableStations.find(s => s.id === form.watch("stationId"));
  const duration = form.watch("duration");
  const totalAmount = selectedStation ? (selectedStation.hourly_rate * (duration / 60)) : 0;

  const handleGuestSelect = (guestId: string) => {
    if (guestId === "add_new") {
      setShowAddGuestModal(true);
      return;
    }
    
    form.setValue("guestId", guestId);
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      form.setValue("playerName", guest.name);
      form.setValue("playerPhone", guest.phone || "");
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      const bookingDate = new Date(data.startTime);
      const bookingTime = bookingDate.toTimeString().split(' ')[0]; // HH:MM:SS

      await createBooking({
        station_id: data.stationId,
        player_name: data.playerName,
        player_phone: data.playerPhone,
        booking_date: bookingDate.toISOString().split('T')[0],
        start_time: bookingTime,
        duration_hours: data.duration / 60,
        total_amount: totalAmount,
        payment_status: "pending",
        status: "confirmed"
      });
      
      toast.success("Booking created successfully!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Create a new gaming station booking.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Guest (Optional)</FormLabel>
                  <Select onValueChange={handleGuestSelect} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select guest or enter manually" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="add_new">+ Add New Guest</SelectItem>
                      {guests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.name} - {guest.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="playerName"
                rules={{ required: "Player name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter player name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playerPhone"
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stationId"
              rules={{ required: "Station is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gaming Station</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gaming station" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.station_name} - {formatCurrency(station.hourly_rate)}/hour
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                rules={{ required: "Start time is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                rules={{ 
                  required: "Duration is required",
                  min: { value: 30, message: "Minimum 30 minutes" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any special requests or preferences" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedStation && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Booking Summary</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Station:</span>
                    <span>{selectedStation.station_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>{formatCurrency(selectedStation.hourly_rate)}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{duration} minutes</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      
      <AddGuestModal
        open={showAddGuestModal}
        onOpenChange={setShowAddGuestModal}
      />
    </Dialog>
  );
};

export default NewBookingModal;