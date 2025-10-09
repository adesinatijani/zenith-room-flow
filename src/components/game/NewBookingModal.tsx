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

interface NewBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookingFormData {
  playerName: string;
  playerPhone: string;
  stationId: string;
  duration: number;
  startTime: string;
  specialRequests: string;
}

const NewBookingModal = ({ open, onOpenChange }: NewBookingModalProps) => {
  const { formatCurrency } = useGlobalSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    defaultValues: {
      playerName: "",
      playerPhone: "",
      stationId: "",
      duration: 60,
      startTime: "",
      specialRequests: "",
    },
  });

  const availableStations = [
    { id: "2", name: "Gaming PC #1", rate: 30, status: "available" },
    { id: "6", name: "Gaming PC #2", rate: 30, status: "available" },
    { id: "5", name: "Xbox Series X #1", rate: 25, status: "reserved" },
  ];

  const selectedStation = availableStations.find(s => s.id === form.watch("stationId"));
  const duration = form.watch("duration");
  const totalAmount = selectedStation ? (selectedStation.rate * (duration / 60)) : 0;

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Creating booking:", { ...data, totalAmount });
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
                          {station.name} - {formatCurrency(station.rate)}/hour ({station.status})
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
                    <span>{selectedStation.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>{formatCurrency(selectedStation.rate)}/hour</span>
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
    </Dialog>
  );
};

export default NewBookingModal;