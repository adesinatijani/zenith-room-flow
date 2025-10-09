import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { Calendar, Clock, CreditCard, MapPin, Star } from "lucide-react";
import { useMemo } from "react";

interface GuestHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestName: string;
}

const GuestHistoryModal = ({ open, onOpenChange, guestName }: GuestHistoryModalProps) => {
  const { formatCurrency } = useGlobalSettings();
  const { bookings } = useRoomsDB();
  const { guests } = useGuestsDB();
  
  // Get guest by name
  const guest = useMemo(() => 
    guests.find(g => g.name === guestName), 
    [guests, guestName]
  );

  // Get booking history for this guest from database
  const bookingHistory = useMemo(() => 
    bookings
      .filter(b => b.guest_name === guestName)
      .map(booking => ({
        id: booking.id,
        roomNumber: booking.room_id,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        status: booking.booking_status as 'completed' | 'cancelled' | 'active',
        amount: booking.total_amount,
        services: [] // Can be extended when services tracking is added
      }))
      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()),
    [bookings, guestName]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'active': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalSpent = guest?.total_spent || 0;
  const totalBookings = guest?.total_bookings || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Booking History - {guestName}
          </DialogTitle>
          <DialogDescription>
            Complete booking and service history for this guest
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="card-luxury">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card className="card-luxury">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </CardContent>
            </Card>
            <Card className="card-luxury">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">4.8</span>
                </div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Booking History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Booking History</h3>
            {bookingHistory.map((booking) => (
              <Card key={booking.id} className="card-luxury">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Room {booking.roomNumber}</h4>
                        <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                      <p className="text-lg font-bold mt-1">{formatCurrency(booking.amount)}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Check-in: {booking.checkIn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Check-out: {booking.checkOut}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.services.length} services</span>
                    </div>
                  </div>
                  
                   {booking.services.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">Services Used:</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.services.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                   )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestHistoryModal;