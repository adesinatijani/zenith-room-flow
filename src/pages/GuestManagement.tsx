import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AddGuestModal from "@/components/guest/AddGuestModal";
import GuestHistoryModal from "@/components/guest/GuestHistoryModal";
import EditGuestModal from "@/components/guest/EditGuestModal";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import {
  Users, 
  Search,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const GuestManagement = () => {
  const { toast } = useToast();
  const { guests, loading, addGuest, updateGuest } = useGuestsDB();
  const { bookings } = useRoomsDB();
  const { formatCurrency } = useGlobalSettings();
  
  const [activeTab, setActiveTab] = useState("guests");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGuestName, setSelectedGuestName] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState("");

  // Map bookings to current stays
  const currentStays = bookings
    .filter(b => b.booking_status === 'active')
    .map(booking => ({
      guestId: booking.id,
      guestName: booking.guest_name,
      roomNumber: `Room ${booking.room_id}`,
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      status: 'checked-in' as const
    }));

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone?.includes(searchTerm)
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-500 text-white';
      case 'Gold': return 'bg-yellow-500 text-black';
      case 'Silver': return 'bg-gray-400 text-black';
      default: return 'bg-amber-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-accent text-accent-foreground';
      case 'blacklisted': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-success text-success-foreground';
    }
  };

  const getStayStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in': return CheckCircle;
      case 'checked-out': return Clock;
      default: return AlertCircle;
    }
  };

  const getGuestStats = () => {
    const total = guests.length;
    const vip = guests.filter(g => g.status === 'vip').length;
    const active = guests.filter(g => g.status === 'active').length;
    const totalRevenue = guests.reduce((sum, g) => sum + g.total_spent, 0);

    return { total, vip, active, totalRevenue };
  };

  const stats = getGuestStats();

  const handleAddNewGuest = () => {
    setShowAddModal(true);
  };

  const handleViewHistory = (guestName: string) => {
    setSelectedGuestName(guestName);
    setShowHistoryModal(true);
  };

  const handleEditProfile = (guest: typeof guests[0]) => {
    setSelectedGuestId(guest.id);
    setSelectedGuestName(guest.name);
    setShowEditModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Management</h1>
          <p className="text-muted-foreground">Manage guest profiles and track customer relationships</p>
        </div>
        <Button className="button-luxury" onClick={handleAddNewGuest}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Guest
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guests">All Guests</TabsTrigger>
          <TabsTrigger value="current">Current Stays</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredGuests.map((guest) => (
              <Card key={guest.id} className="card-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{guest.name}</h3>
                        <p className="text-muted-foreground">Guest ID: {guest.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTierColor(guest.loyalty_tier)}>
                        <Star className="h-3 w-3 mr-1" />
                        {guest.loyalty_tier}
                      </Badge>
                      <Badge className={getStatusColor(guest.status)}>
                        {guest.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{guest.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{guest.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{guest.nationality}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Booking History</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{guest.total_bookings} bookings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatCurrency(guest.total_spent)} spent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Last stay: {guest.last_stay || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Preferences & Notes</h4>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {guest.preferences.map((pref, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{guest.notes}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleViewHistory(guest.name)}>
                      View History
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditProfile(guest)}>
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-4">
            {currentStays.map((stay, index) => {
              const StatusIcon = getStayStatusIcon(stay.status);
              return (
                <Card key={index} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                          <StatusIcon className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{stay.guestName}</h3>
                          <p className="text-muted-foreground">Room {stay.roomNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={stay.status === 'checked-in' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                          {stay.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stay.checkIn} to {stay.checkOut}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Guests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  VIP Guests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vip}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.vip / stats.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Guests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Regular status guests
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From guest bookings
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <AddGuestModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
      
      <GuestHistoryModal
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        guestName={selectedGuestName}
      />
      
      <EditGuestModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        guestId={selectedGuestId}
        guestName={selectedGuestName}
      />
    </div>
  );
};

export default GuestManagement;