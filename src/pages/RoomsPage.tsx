import React, { useState, useMemo, memo } from "react";
import { 
  Bed, 
  Users, 
  Wifi,
  Tv,
  Coffee,
  Car,
  Bath,
  ArrowLeft,
  Star,
  ChevronDown,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { Skeleton } from "@/components/ui/skeleton";

// Memoized room card component for better performance
const RoomCard = memo(({ room, formatCurrency, getAmenityIcon }: { 
  room: any; 
  formatCurrency: (amount: number) => string;
  getAmenityIcon: (amenity: string) => React.ReactNode;
}) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
    {/* Room Image Placeholder */}
    <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <Bed className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-primary/40" />
      </div>
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
        <Badge className="bg-green-500 text-white text-xs sm:text-sm">Available</Badge>
      </div>
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{formatCurrency(room.rate)}</div>
        <div className="text-xs sm:text-sm opacity-90">per night</div>
      </div>
    </div>

    <CardHeader className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg sm:text-xl">Room {room.room_number}</CardTitle>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{room.capacity}</span>
        </div>
      </div>
      <CardDescription className="text-base sm:text-lg font-medium text-foreground">
        {room.room_type}
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6 pt-0">
      {room.description && (
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{room.description}</p>
      )}

      {/* Room Details */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
        <div>
          <span className="text-muted-foreground">Floor:</span>
          <span className="ml-1 sm:ml-2 font-medium">{room.floor_number || 'N/A'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Capacity:</span>
          <span className="ml-1 sm:ml-2 font-medium">{room.capacity} guests</span>
        </div>
      </div>

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 text-sm sm:text-base">Amenities</h4>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {room.amenities.slice(0, 4).map((amenity: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <span className="mr-1">{getAmenityIcon(amenity)}</span>
                <span className="hidden sm:inline">{amenity}</span>
                <span className="sm:hidden">{amenity.slice(0, 6)}</span>
              </Badge>
            ))}
            {room.amenities.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{room.amenities.length - 4}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Book Now Button */}
      <Button className="w-full mt-3 sm:mt-4 group-hover:shadow-md transition-shadow touch-target" asChild>
        <a href={`/book?room=${room.id}`}>
          Book This Room
        </a>
      </Button>
    </CardContent>
  </Card>
));

const RoomsPage = () => {
  const { rooms, loading } = useRoomsDB();
  const { formatCurrency, settings } = useGlobalSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("price-low");

  // Memoize expensive calculations
  const availableRooms = useMemo(() => 
    rooms.filter(room => room.status === 'available'),
    [rooms]
  );

  const filteredRooms = useMemo(() =>
    availableRooms
      .filter(room => {
        const matchesSearch = room.room_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             room.room_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || room.room_type.toLowerCase().includes(filterType.toLowerCase());
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.rate - b.rate;
          case "price-high":
            return b.rate - a.rate;
          case "capacity":
            return b.capacity - a.capacity;
          case "type":
            return a.room_type.localeCompare(b.room_type);
          default:
            return 0;
        }
      }),
    [availableRooms, searchQuery, filterType, sortBy]
  );

  const roomTypes = useMemo(() =>
    [...new Set(availableRooms.map(room => room.room_type))],
    [availableRooms]
  );

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return <Tv className="h-4 w-4" />;
    if (amenityLower.includes('coffee') || amenityLower.includes('bar')) return <Coffee className="h-4 w-4" />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="h-4 w-4" />;
    if (amenityLower.includes('bath') || amenityLower.includes('shower')) return <Bath className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/">
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Back to Home</span>
                    <span className="sm:hidden">Back</span>
                  </a>
                </Button>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">{settings.hotel_name}</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Available Rooms</p>
                </div>
              </div>
              <Button size="sm" asChild>
                <a href="/book">Book Now</a>
              </Button>
            </div>
          </div>
        </header>

        {/* Loading Skeletons */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </a>
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">{settings.hotel_name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredRooms.length} available room{filteredRooms.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button size="sm" asChild>
              <a href="/book">Book Now</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search rooms..." 
                  className="pl-10 touch-target"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="touch-target">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Room Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="touch-target">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="capacity">Capacity</SelectItem>
                    <SelectItem value="type">Room Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="container mx-auto px-2 sm:px-4 pb-6 sm:pb-8">
        {filteredRooms.length === 0 ? (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <Bed className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No rooms available</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {availableRooms.length === 0 
                  ? "All rooms are currently occupied. Please check back later."
                  : "No rooms match your search criteria. Try adjusting your filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                formatCurrency={formatCurrency}
                getAmenityIcon={getAmenityIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;