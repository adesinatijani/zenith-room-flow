import React, { useState, useMemo, useCallback, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Clock, Users, MapPin, Phone, Mail, ArrowLeft, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { toast } from "sonner";
import heroImage from "@/assets/hero-hotel.jpg";

// Memoized form input component
const FormInput = memo(({ label, id, type = "text", required = false, className = "", value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label} {required && '*'}</Label>
    <Input 
      type={type}
      id={id} 
      className={`touch-target ${className}`}
      value={value}
      onChange={onChange}
      required={required}
      {...props}
    />
  </div>
));

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const { rooms, loading, createRoomBooking } = useRoomsDB();
  const { formatCurrency, settings } = useGlobalSettings();
  
  // Memoize derived values to prevent unnecessary re-calculations
  const preSelectedRoomId = useMemo(() => searchParams.get('room'), [searchParams]);
  const preSelectedRoom = useMemo(() => 
    rooms.find(room => room.id === preSelectedRoomId),
    [rooms, preSelectedRoomId]
  );
  const availableRooms = useMemo(() => 
    rooms.filter(room => room.status === 'available'),
    [rooms]
  );
  
  // Form state
  const [formData, setFormData] = useState({
    selectedRoomId: preSelectedRoomId || '',
    checkInDate: '',
    checkOutDate: '',
    guests: '',
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate nights and total
  const calculateBookingDetails = () => {
    if (!formData.checkInDate || !formData.checkOutDate || !formData.selectedRoomId) {
      return { nights: 0, total: 0, selectedRoom: null };
    }
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    const selectedRoom = rooms.find(room => room.id === formData.selectedRoomId);
    const total = nights > 0 && selectedRoom ? nights * selectedRoom.rate : 0;
    
    return { nights: Math.max(0, nights), total, selectedRoom };
  };

  const { nights, total, selectedRoom } = calculateBookingDetails();

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedRoomId || !formData.checkInDate || !formData.checkOutDate || 
        !formData.fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createRoomBooking({
        room_id: formData.selectedRoomId,
        guest_name: formData.fullName,
        guest_email: formData.email,
        guest_phone: formData.phone,
        check_out_date: formData.checkOutDate,
        nights,
        total_amount: total,
        special_requests: formData.specialRequests || undefined
      });
      
      toast.success("Booking confirmed! We look forward to your stay.");
      
      // Reset form
      setFormData({
        selectedRoomId: '',
        checkInDate: '',
        checkOutDate: '',
        guests: '',
        fullName: '',
        email: '',
        phone: '',
        specialRequests: ''
      });
      
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <header className="bg-card border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-lg">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold">{settings.hotel_name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Book Your Perfect Stay</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <a href="/rooms">Rooms</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-48 sm:h-64 lg:h-96 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Luxury hotel lobby" 
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="max-w-2xl text-primary-foreground">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Experience Luxury</h2>
              <p className="text-sm sm:text-lg lg:text-xl opacity-90">Book your perfect stay with world-class amenities and exceptional service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Payment Notice */}
          <div className="mb-8">
            <div className="bg-accent/20 border-l-4 border-accent p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent rounded-full">
                  <Clock className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2">Important Payment Information</h3>
                  <p className="text-accent-foreground/90">
                    Reservation that is not paid for within 1hr is revoked. Ensure you call our phone number for payment details. Thank you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Booking Form */}
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="text-2xl">Make a Reservation</CardTitle>
                <CardDescription>
                  {preSelectedRoom 
                    ? `Booking Room ${preSelectedRoom.room_number} - ${preSelectedRoom.room_type}`
                    : "Fill in your details to book your stay"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Room Selection */}
                  {!preSelectedRoom && (
                    <div className="space-y-2">
                      <Label htmlFor="room">Select Room *</Label>
                      <Select 
                        value={formData.selectedRoomId} 
                        onValueChange={(value) => handleInputChange('selectedRoomId', value)}
                      >
                        <SelectTrigger className="touch-target">
                          <SelectValue placeholder="Choose a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.room_number} - {room.room_type} ({formatCurrency(room.rate)}/night)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Selected Room Display */}
                  {selectedRoom && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Room {selectedRoom.room_number}</h4>
                          <Badge>Available</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{selectedRoom.room_type}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate per night:</span>
                          <span className="font-bold">{formatCurrency(selectedRoom.rate)}</span>
                        </div>
                        {selectedRoom.capacity && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm">Capacity:</span>
                            <span className="text-sm">{selectedRoom.capacity} guests</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkin">Check-in Date *</Label>
                      <Input 
                        type="date" 
                        id="checkin" 
                        className="touch-target" 
                        value={formData.checkInDate}
                        onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout">Check-out Date *</Label>
                      <Input 
                        type="date" 
                        id="checkout" 
                        className="touch-target" 
                        value={formData.checkOutDate}
                        onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                        min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  {/* Booking Summary */}
                  {nights > 0 && selectedRoom && (
                    <Card className="bg-accent/10 border-accent/20">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Room rate:</span>
                            <span>{formatCurrency(selectedRoom.rate)} × {nights}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <FormInput
                    label="Full Name"
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Email"
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                      required
                    />
                    <FormInput
                      label="Phone Number"
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requests">Special Requests</Label>
                    <Textarea 
                      id="requests" 
                      placeholder="Any special requests or preferences..." 
                      className="min-h-24" 
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full button-luxury text-lg py-6"
                    disabled={isSubmitting || !selectedRoom || nights <= 0}
                  >
                    {isSubmitting ? "Processing..." : `Book Room - ${formatCurrency(total)}`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Hotel Information */}
            <div className="space-y-6">
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Hotel Amenities</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm">24/7 Concierge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Event Spaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Spa & Wellness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Prime Location</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-accent" />
                    <span>{settings.hotel_phone || "+1 (555) 123-4567"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <span>{settings.hotel_email || "reservations@hotel.com"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>{settings.hotel_address || "123 Luxury Avenue, Downtown"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Available Rooms */}
              {!preSelectedRoom && availableRooms.length > 0 && (
                <Card className="card-luxury">
                  <CardHeader>
                    <CardTitle>Available Rooms</CardTitle>
                    <CardDescription>Browse our available accommodations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {availableRooms.slice(0, 3).map(room => (
                      <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Room {room.room_number}</h4>
                          <p className="text-sm text-muted-foreground">{room.room_type}</p>
                          <p className="text-sm">Up to {room.capacity} guests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(room.rate)}</p>
                          <p className="text-xs text-muted-foreground">per night</p>
                        </div>
                      </div>
                    ))}
                    {availableRooms.length > 3 && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href="/rooms">View All Rooms</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;