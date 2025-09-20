import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { useGuests } from "@/hooks/useGuests";
import { toast } from "sonner";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

interface Room {
  id: string;
  number: string;
  type: string;
  rate: number;
}

interface RoomBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onBookingConfirm: (booking: any) => void;
}

export const RoomBookingModal = ({ open, onOpenChange, room, onBookingConfirm }: RoomBookingModalProps) => {
  const { guests } = useGuests();
  const { formatCurrency } = useGlobalSettings();
  const [selectedGuest, setSelectedGuest] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [nights, setNights] = useState("1");
  const [specialRequests, setSpecialRequests] = useState("");

  const handleBooking = () => {
    if (!room) return;
    
    if (!selectedGuest || !checkInDate || !nights) {
      toast.error("Please fill in all required fields");
      return;
    }

    const guest = guests.find(g => g.id === selectedGuest);
    if (!guest) {
      toast.error("Selected guest not found");
      return;
    }

    const numberOfNights = parseInt(nights);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + numberOfNights);

    const booking = {
      id: Date.now().toString(),
      roomId: room.id,
      roomNumber: room.number,
      roomType: room.type,
      guestId: guest.id,
      guestName: guest.name,
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
      nights: numberOfNights,
      rate: room.rate,
      totalAmount: room.rate * numberOfNights,
      specialRequests,
      status: "confirmed",
      bookingDate: format(new Date(), "yyyy-MM-dd HH:mm")
    };

    // Send to Hotel Services order list
    const orderItem = {
      id: Date.now().toString() + "_room",
      name: `Room ${room.number} - ${room.type}`,
      category: "room",
      price: room.rate,
      image: "/placeholder.svg",
      description: `${numberOfNights} night${numberOfNights > 1 ? 's' : ''} stay`,
      guestName: guest.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      specialRequests
    };

    // This will be handled by the parent component through the callback
    // Add to Hotel Services POS system
    if ((window as any).addRoomBookingToOrder) {
      (window as any).addRoomBookingToOrder(orderItem, numberOfNights);
    }

    onBookingConfirm(booking);
    toast.success(`Room ${room.number} booked for ${guest.name} (${numberOfNights} night${numberOfNights > 1 ? 's' : ''})`);
    onOpenChange(false);
    
    // Reset form
    setSelectedGuest("");
    setCheckInDate(new Date());
    setNights("1");
    setSpecialRequests("");
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book Room {room.number}</DialogTitle>
          <DialogDescription>
            {room.type} - {formatCurrency(room.rate)}/night
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="guest">Select Guest *</Label>
            <Select value={selectedGuest} onValueChange={setSelectedGuest}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a registered guest" />
              </SelectTrigger>
              <SelectContent>
                {guests.map(guest => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.name} - {guest.email}
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
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="nights">Number of Nights *</Label>
            <Input
              id="nights"
              type="number"
              min="1"
              max="30"
              value={nights}
              onChange={(e) => setNights(e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="requests">Special Requests</Label>
            <Input
              id="requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Late check-in, extra towels, etc."
            />
          </div>

          {checkInDate && nights && (
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="text-sm space-y-1">
                <p>Check-in: {format(checkInDate, "PPP")}</p>
                <p>Check-out: {format(new Date(checkInDate.getTime() + parseInt(nights) * 24 * 60 * 60 * 1000), "PPP")}</p>
                <p>Duration: {nights} night{parseInt(nights) > 1 ? 's' : ''}</p>
                <p className="font-medium">Total: {formatCurrency(room.rate * parseInt(nights))}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBooking}>
            Book Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};