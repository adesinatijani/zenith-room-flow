import { useState } from "react";
import { 
  Bed, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings,
  Calendar,
  DollarSign,
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRoomModal } from "@/components/room/AddRoomModal";
import { EditRoomModal } from "@/components/room/EditRoomModal";
import { RoomSettingsModal } from "@/components/room/RoomSettingsModal";
import { RoomBookingModal } from "@/components/room/RoomBookingModal";
import { CheckInModal } from "@/components/room/CheckInModal";
import { useGuests } from "@/hooks/useGuests";
import { toast } from "sonner";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useRoomsDB } from "@/hooks/useRoomsDB";

interface FrontendRoom {
  id: string;
  number: string;
  type: "Standard Single" | "Standard Double" | "King Size" | "Queen Size" | "Twin Beds" | "Suite" | "Deluxe Single" | "Deluxe Double" | "Presidential Suite" | "Executive Room";
  status: "ready" | "occupied" | "vacant-dirty" | "under-repairs";
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  rate: number;
  amenities: string[];
  floor: number;
  bedType: string;
  roomSize: number;
}

const RoomManagement = () => {
  const { formatCurrency } = useGlobalSettings();
  const { rooms: dbRooms, bookings, loading, createRoom, updateRoom, deleteRoom, createRoomBooking } = useRoomsDB();
  
  // Map database rooms to frontend format
  const rooms: FrontendRoom[] = dbRooms.map(room => {
    const booking = bookings.find(b => b.room_id === room.id && b.booking_status === 'active');
    
    // Map database status to frontend status
    let frontendStatus: FrontendRoom['status'] = 'ready';
    if (room.status === 'available') frontendStatus = 'ready';
    else if (room.status === 'occupied') frontendStatus = 'occupied';
    else if (room.status === 'cleaning') frontendStatus = 'vacant-dirty';
    else if (room.status === 'maintenance') frontendStatus = 'under-repairs';
    
    return {
      id: room.id,
      number: room.room_number,
      type: room.room_type as any,
      status: frontendStatus,
      guest: booking?.guest_name,
      checkIn: booking?.check_in_date,
      checkOut: booking?.check_out_date,
      rate: Number(room.rate),
      amenities: room.amenities || [],
      floor: room.floor_number || 1,
      bedType: room.description || room.room_type,
      roomSize: room.capacity || 30
    };
  });

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFloor, setFilterFloor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [showRoomBooking, setShowRoomBooking] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<FrontendRoom | null>(null);

  const statusColors = {
    ready: "bg-green-500",
    occupied: "bg-red-500", 
    "vacant-dirty": "bg-yellow-500",
    "under-repairs": "bg-orange-500"
  };

  const statusLabels = {
    ready: "Ready",
    occupied: "Occupied",
    "vacant-dirty": "Vacant Dirty", 
    "under-repairs": "Under Repairs"
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    const matchesFloor = filterFloor === "all" || room.floor.toString() === filterFloor;
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.guest && room.guest.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesFloor && matchesSearch;
  });

  const getStatusStats = () => {
    return {
      total: rooms.length,
      ready: rooms.filter(r => r.status === "ready").length,
      occupied: rooms.filter(r => r.status === "occupied").length,
      vacantDirty: rooms.filter(r => r.status === "vacant-dirty").length,
      underRepairs: rooms.filter(r => r.status === "under-repairs").length,
    };
  };

  const stats = getStatusStats();

  const handleAddRoom = async (roomData: {
    room_number: string;
    room_type: string;
    rate: number;
    floor_number: number;
    capacity: number;
    amenities: string[];
    description: string;
  }) => {
    await createRoom(roomData);
  };

  const handleEditRoom = (room: FrontendRoom) => {
    setSelectedRoom(room);
    setShowEditRoom(true);
  };

  const handleRoomSettings = (room: FrontendRoom) => {
    setSelectedRoom(room);
    setShowRoomSettings(true);
  };

  const handleBookRoom = (room: FrontendRoom) => {
    setSelectedRoom(room);
    setShowRoomBooking(true);
  };

  const handleRoomUpdate = async (updatedRoom: FrontendRoom) => {
    await updateRoom(updatedRoom.id, {
      room_number: updatedRoom.number,
      room_type: updatedRoom.type,
      rate: updatedRoom.rate,
      floor_number: updatedRoom.floor,
      capacity: updatedRoom.roomSize,
      amenities: updatedRoom.amenities,
      description: updatedRoom.bedType,
      status: updatedRoom.status === 'ready' ? 'available' : updatedRoom.status as any
    });
  };

  const handleCheckOut = async (room: FrontendRoom) => {
    const updatedRoom = {
      ...room,
      status: "vacant-dirty" as const,
      guest: undefined,
      checkIn: undefined,
      checkOut: undefined
    };
    await handleRoomUpdate(updatedRoom);
    toast.success(`${room.guest} checked out from Room ${room.number}`);
  };

  const handleCheckIn = (room: FrontendRoom) => {
    setSelectedRoom(room);
    setShowCheckIn(true);
  };

  const handleCheckInConfirm = async (checkInData: any) => {
    await createRoomBooking({
      room_id: checkInData.roomId,
      guest_name: checkInData.guestName,
      guest_phone: checkInData.guestPhone,
      guest_email: checkInData.guestEmail,
      check_out_date: checkInData.checkOut,
      nights: checkInData.nights || 1,
      total_amount: checkInData.totalAmount || 0,
      special_requests: checkInData.specialRequests
    });
  };

  const handleRoomDelete = async (roomId: string) => {
    await deleteRoom(roomId);
  };

  const handleBookingConfirm = async (booking: any) => {
    await createRoomBooking({
      room_id: booking.roomId,
      guest_name: booking.guestName,
      guest_phone: booking.guestPhone,
      guest_email: booking.guestEmail,
      check_out_date: booking.checkOut,
      nights: booking.nights || 1,
      total_amount: booking.totalAmount || 0,
      special_requests: booking.specialRequests
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage hotel rooms, occupancy, and maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddRoom(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Rooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="text-sm text-muted-foreground">Ready</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
            <div className="text-sm text-muted-foreground">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.vacantDirty}</div>
            <div className="text-sm text-muted-foreground">Vacant Dirty</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.underRepairs}</div>
            <div className="text-sm text-muted-foreground">Under Repairs</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rooms, guests..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant-dirty">Vacant Dirty</SelectItem>
                <SelectItem value="under-repairs">Under Repairs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room {room.number}</CardTitle>
                <Badge 
                  className={`${statusColors[room.status]} text-white`}
                >
                  {statusLabels[room.status]}
                </Badge>
              </div>
              <CardDescription>{room.type}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate:</span>
                  <span className="font-bold">{formatCurrency(room.rate)}/night</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Floor:</span>
                  <span>{room.floor}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bed Type:</span>
                  <span className="text-sm">{room.bedType}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Size:</span>
                  <span className="text-sm">{room.roomSize}m²</span>
                </div>

                {room.guest && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Guest:</span>
                      <span className="text-sm">{room.guest}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check-out:</span>
                      <span className="text-sm">{room.checkOut}</span>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{room.amenities.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEditRoom(room)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRoomSettings(room)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  {room.status === "occupied" && (
                    <Button size="sm" onClick={() => handleCheckOut(room)}>
                      <LogOut className="h-4 w-4 mr-1" />
                      Check Out
                    </Button>
                  )}
                  {room.status === "ready" && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => handleBookRoom(room)}>
                        <Calendar className="h-4 w-4 mr-1" />
                        Book
                      </Button>
                      <Button size="sm" onClick={() => handleCheckIn(room)}>
                        <LogIn className="h-4 w-4 mr-1" />
                        Check In
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <AddRoomModal
        open={showAddRoom}
        onOpenChange={setShowAddRoom}
        onRoomAdd={handleAddRoom}
      />

      <EditRoomModal
        open={showEditRoom}
        onOpenChange={setShowEditRoom}
        room={selectedRoom}
        onRoomUpdate={handleRoomUpdate}
      />

      <RoomSettingsModal
        open={showRoomSettings}
        onOpenChange={setShowRoomSettings}
        room={selectedRoom}
        onRoomUpdate={handleRoomUpdate}
        onRoomDelete={handleRoomDelete}
      />

      <RoomBookingModal
        open={showRoomBooking}
        onOpenChange={setShowRoomBooking}
        room={selectedRoom}
        onBookingConfirm={handleBookingConfirm}
      />

      <CheckInModal
        open={showCheckIn}
        onOpenChange={setShowCheckIn}
        room={selectedRoom}
        onCheckInConfirm={handleCheckInConfirm}
      />
    </div>
  );
};

export default RoomManagement;