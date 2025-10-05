import { useState } from "react";
import { 
  Calendar as CalendarIcon,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useHallsDB } from "@/hooks/useHallsDB";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const HallManagement = () => {
  const { halls, bookings, loading, createBooking, updateBooking, cancelBooking } = useHallsDB();
  const { guests: registeredGuests } = useGuestsDB();

  const [activeTab, setActiveTab] = useState("halls");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedGuest, setSelectedGuest] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [event, setEvent] = useState("");

  const statusColors = {
    available: "bg-green-500",
    booked: "bg-red-500",
    maintenance: "bg-yellow-500",
    confirmed: "bg-green-500",
    pending: "bg-yellow-500", 
    cancelled: "bg-red-500"
  };

  const getHallStats = () => {
    return {
      total: halls.length,
      available: halls.filter(h => h.availability === "available").length,
      booked: halls.filter(h => h.availability === "booked").length,
      maintenance: halls.filter(h => h.availability === "maintenance").length,
    };
  };

  const getBookingStats = () => {
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      pending: bookings.filter(b => b.status === "pending").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
    };
  };

  const hallStats = getHallStats();
  const bookingStats = getBookingStats();

  const handleNewBooking = () => {
    if (!selectedGuest || !selectedHall || !selectedDate || !event.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all booking details",
        variant: "destructive",
      });
      return;
    }

    const hall = halls.find(h => h.id === selectedHall);
    if (!hall) return;

    const days = endDate && selectedDate ? differenceInDays(endDate, selectedDate) + 1 : 1;
    const guest = registeredGuests.find(g => g.id === selectedGuest);
    
    // Add booking to hotel services by storing in localStorage
    const bookingData = {
      id: `hall-${hall.id}`,
      name: hall.name,
      guestName: guest?.name || "Unknown Guest",
      days: days,
      price: hall.hourly_rate,
      category: "facilities",
      timestamp: Date.now()
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('hallBookings') || '[]');
    existingBookings.push(bookingData);
    localStorage.setItem('hallBookings', JSON.stringify(existingBookings));

    toast({
      title: "Booking Created",
      description: `${hall.name} booked for ${guest?.name} for ${days} day(s). Added to Hotel Services order list.`,
    });

    // Reset form
    setSelectedGuest("");
    setSelectedHall("");
    setSelectedDate(new Date());
    setEndDate(undefined);
    setEvent("");
    setShowNewBooking(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hall Management & Booking</h1>
          <p className="text-muted-foreground">Manage event halls and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCalendar(true)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button onClick={() => setShowNewBooking(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="halls">Halls</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="halls" className="space-y-6">
          {/* Hall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{hallStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Halls</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{hallStats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{hallStats.booked}</div>
                <div className="text-sm text-muted-foreground">Booked</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{hallStats.maintenance}</div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </CardContent>
            </Card>
          </div>

          {/* Halls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.map((hall) => (
              <Card key={hall.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{hall.name}</CardTitle>
                    <Badge className={`${statusColors[hall.availability]} text-white`}>
                      {hall.availability}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {hall.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Capacity</div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{hall.capacity}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Hourly Rate</div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">${hall.hourly_rate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Amenities</div>
                      <div className="flex flex-wrap gap-1">
                        {hall.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {hall.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hall.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedHall(hall.id);
                          setShowNewBooking(true);
                        }}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                      {hall.availability === "available" && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedHall(hall.id);
                            setShowNewBooking(true);
                          }}
                        >
                          Book Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {/* Booking Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{bookingStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
                <div className="text-sm text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
                <div className="text-sm text-muted-foreground">Cancelled</div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {bookings.map((booking) => {
              const hall = halls.find(h => h.id === booking.hall_id);
              return (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold">{booking.event_name}</h3>
                          <Badge className={`${statusColors[booking.status]} text-white`}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Hall: </span>
                            <span className="font-medium">{hall?.name || 'Unknown Hall'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Organizer: </span>
                            <span className="font-medium">{booking.organizer_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date & Time: </span>
                            <span className="font-medium">{booking.booking_date} {booking.start_time}-{booking.end_time}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Guests: </span>
                            <span className="font-medium">{booking.number_of_guests || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold">${Number(booking.total_amount).toLocaleString()}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" variant="default">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Hall Booking Calendar</h3>
                  <Button onClick={() => setShowNewBooking(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Booking
                  </Button>
                </div>
                
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Bookings for {selectedDate ? format(selectedDate, "PPP") : "Select a date"}</h4>
                  <div className="space-y-2">
                    {bookings
                      .filter(booking => booking.booking_date === (selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""))
                      .map(booking => {
                        const hall = halls.find(h => h.id === booking.hall_id);
                        return (
                          <div key={booking.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{booking.event_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {hall?.name || 'Unknown Hall'} • {booking.start_time}-{booking.end_time}
                                </div>
                              </div>
                              <Badge className={`${statusColors[booking.status]} text-white`}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    }
                    {selectedDate && bookings.filter(booking => 
                      booking.booking_date === format(selectedDate, "yyyy-MM-dd")
                    ).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No bookings for this date</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Calendar View</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* New Booking Dialog */}
      <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Hall Booking</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest">Select Guest</Label>
                <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a registered guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredGuests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name} - {guest.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hall">Select Hall</Label>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a hall" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.filter(hall => hall.availability === "available").map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name} - ${hall.hourly_rate}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event Name</Label>
              <Input
                id="event"
                placeholder="Enter event name"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Same day booking"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => selectedDate ? date < selectedDate : false}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedDate && endDate && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Booking Duration: </span>
                  {differenceInDays(endDate, selectedDate) + 1} day(s)
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBooking(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewBooking}>
              Book Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HallManagement;