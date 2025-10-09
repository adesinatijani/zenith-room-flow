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
import { GameStation, useGameCenterDB } from "@/hooks/useGameCenterDB";

interface StartSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station?: GameStation | null;
}

interface SessionFormData {
  playerName: string;
  playerPhone: string;
  duration: number;
  paymentMethod: string;
}

const StartSessionModal = ({ open, onOpenChange, station }: StartSessionModalProps) => {
  const { formatCurrency } = useGlobalSettings();
  const { startSession } = useGameCenterDB();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SessionFormData>({
    defaultValues: {
      playerName: "",
      playerPhone: "",
      duration: 60,
      paymentMethod: "cash",
    },
  });

  const duration = form.watch("duration");
  const totalAmount = station ? (station.hourly_rate * (duration / 60)) : 0;

  const onSubmit = async (data: SessionFormData) => {
    if (!station) return;
    
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      await startSession({
        station_id: station.id,
        player_name: data.playerName,
        player_phone: data.playerPhone,
        start_time: now.toISOString(),
        hourly_rate: station.hourly_rate,
        total_amount: totalAmount,
        payment_status: data.paymentMethod === "room_charge" ? "pending" : "paid",
        payment_method: data.paymentMethod,
        status: "active",
      });
      
      toast.success("Gaming session started successfully!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to start session");
      console.error("Error starting session:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!station) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start Gaming Session</DialogTitle>
          <DialogDescription>
            Start a new session on {station.station_name}
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
                      <Input type="tel" placeholder="Enter phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              rules={{ required: "Duration is required", min: { value: 30, message: "Minimum 30 minutes" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
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

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="room_charge">Room Charge</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Station:</span>
                <span className="font-medium">{station.station_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Hourly Rate:</span>
                <span className="font-medium">{formatCurrency(station.hourly_rate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Starting..." : "Start Session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StartSessionModal;
