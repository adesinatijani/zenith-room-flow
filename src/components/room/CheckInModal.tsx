import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { toast } from "sonner";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import AddGuestModal from "@/components/guest/AddGuestModal";

interface Room {
  id: string;
  number: string;
  type: string;
  rate: number;
}

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onCheckInConfirm: (checkIn: any) => void;
}

export const CheckInModal = ({ open, onOpenChange, room, onCheckInConfirm }: CheckInModalProps) => {
  const { guests } = useGuestsDB();
  const { formatCurrency } = useGlobalSettings();
  const [selectedGuest, setSelectedGuest] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(new Date(Date.now() + 86400000)); // Tomorrow
  const [showAddGuest, setShowAddGuest] = useState(false);

  const handleCheckIn = () => {
    if (!room) return;
    
    if (!selectedGuest || !checkInDate || !checkOutDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const guest = guests.find(g => g.id === selectedGuest);
    if (!guest) {
      toast.error("Selected guest not found");
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    const checkIn = {
      roomId: room.id,
      roomNumber: room.number,
      guestId: guest.id,
      guestName: guest.name,
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
      checkInTime: format(new Date(), "HH:mm")
    };

    onCheckInConfirm(checkIn);
    toast.success(`${guest.name} checked into Room ${room.number}`);
    onOpenChange(false);
    
    // Reset form
    setSelectedGuest("");
    setCheckInDate(new Date());
    setCheckOutDate(new Date(Date.now() + 86400000));
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Check-in to Room {room.number}</DialogTitle>
          <DialogDescription>
            {room.type} - {formatCurrency(room.rate)}/night
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="guest">Select Registered Guest *</Label>
            <Select value={selectedGuest} onValueChange={(value) => {
              if (value === "add-new") {
                setShowAddGuest(true);
              } else {
                setSelectedGuest(value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a registered guest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add-new" className="text-primary font-medium">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add New Guest</span>
                  </div>
                </SelectItem>
                {guests.map(guest => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.name}{guest.email ? ` - ${guest.email}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Check-in Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Check-out Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  disabled={(date) => !checkInDate || date <= checkInDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {checkInDate && checkOutDate && (
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium mb-2">Check-in Summary</h4>
              <div className="text-sm space-y-1">
                <p>Check-in: {format(checkInDate, "PPP")}</p>
                <p>Check-out: {format(checkOutDate, "PPP")}</p>
                <p>Duration: {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} night(s)</p>
                <p className="font-medium">Rate: {formatCurrency(room.rate)}/night</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCheckIn}>
            Check In Guest
          </Button>
        </DialogFooter>
      </DialogContent>

      <AddGuestModal
        open={showAddGuest}
        onOpenChange={setShowAddGuest}
      />
    </Dialog>
  );
};