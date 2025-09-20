import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, User, Clock } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";

interface Room {
  id: string;
  number: string;
  type: string;
  status: "ready" | "occupied" | "vacant-dirty" | "under-repairs";
  rate: number;
  floor: number;
  bedType: string;
  roomSize: number;
  amenities: string[];
  guest?: string;
  checkIn?: string;
  checkOut?: string;
}

interface RoomCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

// Mock booking data - in a real app, this would come from your database
const mockBookings = [
  {
    id: "1",
    guestName: "John Smith",
    checkIn: "2024-01-15",
    checkOut: "2024-01-18",
    status: "confirmed"
  },
  {
    id: "2", 
    guestName: "Sarah Johnson",
    checkIn: "2024-01-20",
    checkOut: "2024-01-23",
    status: "confirmed"
  },
  {
    id: "3",
    guestName: "Mike Brown",
    checkIn: "2024-01-25",
    checkOut: "2024-01-28",
    status: "pending"
  }
];

export const RoomCalendarModal = ({ open, onOpenChange, room }: RoomCalendarModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  if (!room) return null;

  const getBookingForDate = (date: Date) => {
    return mockBookings.find(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      return date >= checkIn && date <= checkOut;
    });
  };

  const getBookingsForSelectedDate = () => {
    if (!selectedDate) return [];
    return mockBookings.filter(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      return selectedDate >= checkIn && selectedDate <= checkOut;
    });
  };

  const modifiers = {
    booked: (date: Date) => !!getBookingForDate(date),
    checkin: (date: Date) => mockBookings.some(b => isSameDay(parseISO(b.checkIn), date)),
    checkout: (date: Date) => mockBookings.some(b => isSameDay(parseISO(b.checkOut), date)),
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
    },
    checkin: {
      backgroundColor: 'hsl(var(--success))',
      color: 'white',
    },
    checkout: {
      backgroundColor: 'hsl(var(--warning))',
      color: 'white',
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Room {room.number} Calendar
          </DialogTitle>
          <DialogDescription>
            View and manage bookings for this room
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Check-in</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Check-out</span>
              </div>
            </div>
          </div>

          {/* Room Info & Selected Date Details */}
          <div className="space-y-6">
            {/* Room Information */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-3">Room Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Type:</span> {room.type}</p>
                <p><span className="font-medium">Floor:</span> {room.floor}</p>
                <p><span className="font-medium">Rate:</span> ${room.rate}/night</p>
                <p><span className="font-medium">Bed:</span> {room.bedType}</p>
                <p><span className="font-medium">Size:</span> {room.roomSize} sq ft</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Status:</span>
                  <Badge variant={room.status === 'ready' ? 'default' : 'secondary'}>
                    {room.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                
                {getBookingsForSelectedDate().length > 0 ? (
                  <div className="space-y-3">
                    {getBookingsForSelectedDate().map(booking => (
                      <div key={booking.id} className="bg-muted p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{booking.guestName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(parseISO(booking.checkIn), 'MMM d')} - {format(parseISO(booking.checkOut), 'MMM d')}
                          </span>
                        </div>
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className="mt-2"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No bookings for this date</p>
                )}
              </div>
            )}

            {/* Upcoming Bookings */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Upcoming Bookings</h3>
              <div className="space-y-2">
                {mockBookings.slice(0, 3).map(booking => (
                  <div key={booking.id} className="text-sm p-2 bg-muted rounded">
                    <div className="font-medium">{booking.guestName}</div>
                    <div className="text-muted-foreground">
                      {format(parseISO(booking.checkIn), 'MMM d')} - {format(parseISO(booking.checkOut), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};