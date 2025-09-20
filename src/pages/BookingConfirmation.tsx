import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  X, 
  Hotel, 
  Calendar, 
  Users,
  CreditCard,
  Phone,
  Mail
} from "lucide-react";

interface BookingData {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  specialRequests: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  submittedAt: string;
}

// Memoized booking card component
const BookingCard = memo(({ booking, onConfirm, onCancel, getStatusColor, getStatusIcon }: {
  booking: BookingData;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => any;
}) => {
  const StatusIcon = getStatusIcon(booking.status);
  
  return (
    <Card className="card-luxury">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <Hotel className="h-4 w-4 sm:h-5 sm:w-5" />
              Booking #{booking.id}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Submitted on {booking.submittedAt}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Guest Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">Guest Information</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{booking.guestName}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Primary Guest</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{booking.email}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Email Address</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">{booking.phone}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Contact Number</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">Booking Details</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">{booking.checkIn} to {booking.checkOut}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Check-in & Check-out</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Hotel className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">{booking.roomType}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">${booking.totalAmount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {booking.specialRequests && (
          <div>
            <h4 className="font-medium mb-2 text-sm sm:text-base">Special Requests</h4>
            <p className="text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {booking.specialRequests}
            </p>
          </div>
        )}

        <Separator />

        {booking.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => onConfirm(booking.id)}
              className="button-luxury flex-1 touch-target"
            >
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Confirm Booking
            </Button>
            <Button 
              onClick={() => onCancel(booking.id)}
              variant="destructive"
              className="flex-1 touch-target"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Cancel Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Memoize initial booking data to prevent unnecessary re-renders
  const initialBookings = useMemo(() => [
    {
      id: "BK001",
      guestName: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      guests: 2,
      roomType: "Deluxe Suite",
      specialRequests: "High floor, city view",
      totalAmount: 1047,
      status: 'pending' as const,
      submittedAt: "2024-01-10 14:30"
    },
    {
      id: "BK002", 
      guestName: "Maria Garcia",
      email: "maria@example.com",
      phone: "+1 (555) 987-6543",
      checkIn: "2024-01-20",
      checkOut: "2024-01-22",
      guests: 1,
      roomType: "Standard Room",
      specialRequests: "Ground floor access",
      totalAmount: 398,
      status: 'pending' as const,
      submittedAt: "2024-01-11 09:15"
    }
  ], []);

  const [bookings, setBookings] = useState<BookingData[]>(initialBookings);

  // Add new booking from landing page if passed via state
  useEffect(() => {
    if (location.state?.newBooking) {
      const newBooking: BookingData = {
        id: `BK${String(Date.now()).slice(-3)}`,
        ...location.state.newBooking,
        status: 'pending' as const,
        submittedAt: new Date().toLocaleString()
      };
      setBookings(prev => [newBooking, ...prev]);
    }
  }, [location.state]);

  const handleConfirmBooking = useCallback((bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' as const }
          : booking
      )
    );
    toast({
      title: "Booking Confirmed",
      description: "Guest notification has been sent.",
    });
  }, [toast]);

  const handleCancelBooking = useCallback((bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      )
    );
    toast({
      title: "Booking Cancelled",
      description: "Guest has been notified of cancellation.",
      variant: "destructive"
    });
  }, [toast]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-warning text-warning-foreground';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  }, []);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and manage guest reservations</p>
        </div>
        <Button onClick={() => navigate('/admin')} variant="outline" size="sm" className="touch-target">
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {bookings.map((booking) => (
          <BookingCard 
            key={booking.id}
            booking={booking}
            onConfirm={handleConfirmBooking}
            onCancel={handleCancelBooking}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        ))}
      </div>
    </div>
  );
};

export default BookingConfirmation;