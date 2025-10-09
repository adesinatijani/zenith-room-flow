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

interface StartSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station?: {
    id: string;
    name: string;
    hourlyRate: number;
    games: string[];
  };
}

interface SessionFormData {
  playerName: string;
  playerPhone: string;
  duration: number;
  selectedGame: string;
  paymentMethod: string;
}

const StartSessionModal = ({ open, onOpenChange, station }: StartSessionModalProps) => {
  const { formatCurrency } = useGlobalSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SessionFormData>({
    defaultValues: {
      playerName: "",
      playerPhone: "",
      duration: 60,
      selectedGame: "",
      paymentMethod: "cash",
    },
  });

  const duration = form.watch("duration");
  const totalAmount = station ? (station.hourlyRate * (duration / 60)) : 0;

  const onSubmit = async (data: SessionFormData) => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Starting session:", { ...data, stationId: station?.id, totalAmount });
      toast.success("Gaming session started successfully!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to start session");
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
            Start a new session on {station.name}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
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
              name="duration"
              rules={{ 
                required: "Duration is required",
                min: { value: 15, message: "Minimum 15 minutes" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Duration</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedGame"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Game (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a game" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {station.games.map((game) => (
                        <SelectItem key={game} value={game}>
                          {game}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              rules={{ required: "Payment method is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="digital">Digital Wallet</SelectItem>
                      <SelectItem value="account">Hotel Account</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Session Summary</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Station:</span>
                  <span>{station.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span>{formatCurrency(station.hourlyRate)}/hour</span>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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