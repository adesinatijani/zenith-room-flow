import React, { memo, useMemo, useState, useEffect } from "react";
import { 
  Hotel, 
  Calendar, 
  ShoppingCart, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Waves,
  Dumbbell,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Bed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useContentPages } from "@/hooks/useContentPages";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-hotel.jpg";

// Memoized components for better performance
const FeatureCard = memo(({ feature }: { feature: any }) => {
  const Icon = feature.icon;
  return (
    <Card className="card-luxury text-center">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
            <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
      </CardContent>
    </Card>
  );
});

const AmenityCard = memo(({ amenity }: { amenity: any }) => {
  const Icon = amenity.icon;
  return (
    <Card className="card-luxury text-center p-3 sm:p-4 lg:p-6">
      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-accent-foreground" />
      </div>
      <p className="font-medium text-xs sm:text-sm">{amenity.name}</p>
    </Card>
  );
});

const RoomCard = memo(({ room, formatCurrency }: { room: any; formatCurrency: (amount: number) => string }) => {
  return (
    <Card className="card-luxury overflow-hidden hover:shadow-lg transition-all">
      <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Bed className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-primary/40" />
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
      <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
        {room.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{room.description}</p>
        )}
        
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-2 mb-4 sm:mb-6">
            {room.amenities.slice(0, 3).map((amenity: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{amenity}</span>
              </div>
            ))}
            {room.amenities.length > 3 && (
              <div className="text-xs sm:text-sm text-muted-foreground">
                +{room.amenities.length - 3} more amenities
              </div>
            )}
          </div>
        )}
        <Button className="w-full button-luxury text-sm sm:text-base" asChild>
          <a href={`/book?room=${room.id}`}>Book Now</a>
        </Button>
      </CardContent>
    </Card>
  );
});

const Index = () => {
  const { rooms, loading } = useRoomsDB();
  const { formatCurrency, settings } = useGlobalSettings();
  const { getPageBySlug } = useContentPages();
  const [pageContent, setPageContent] = useState<any>(null);

  useEffect(() => {
    getPageBySlug('home').then(data => {
      if (data) setPageContent(data.content);
    });
  }, []);

  // Memoize expensive calculations
  const availableRooms = useMemo(() => 
    rooms.filter(room => room.status === 'available').slice(0, 3),
    [rooms]
  );

  // Memoize static data to prevent re-renders
  const features = useMemo(() => [
    {
      icon: Calendar,
      title: "Online Booking",
      description: "Easy room and event space reservations with real-time availability"
    },
    {
      icon: ShoppingCart,
      title: "Hotel Services", 
      description: "Touch-friendly point of sale for restaurants, bars, and retail"
    },
    {
      icon: Users,
      title: "Guest Management",
      description: "Complete CRM system with guest preferences and history"
    },
    {
      icon: Hotel,
      title: "Room Management",
      description: "Real-time room status, housekeeping, and maintenance tracking"
    }
  ], []);

  const amenities = useMemo(() => [
    { icon: Wifi, name: "Free WiFi" },
    { icon: Car, name: "Valet Parking" },
    { icon: Coffee, name: "Restaurant & Bar" },
    { icon: Waves, name: "Spa & Pool" },
    { icon: Dumbbell, name: "Fitness Center" },
    { icon: Users, name: "24/7 Concierge" }
  ], []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-lg">
                <Hotel className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">{settings.hotel_name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Management System</p>
              </div>
            </div>
            <nav className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <a href="/rooms">Rooms</a>
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <a href="#amenities">Amenities</a>
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <a href="#contact">Contact</a>
              </Button>
              <Button size="sm" className="text-xs sm:text-sm" asChild>
                <a href="/book">Book Now</a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[500px] flex items-center justify-center overflow-hidden">
        <img 
          src={heroImage} 
          alt="Luxury hotel lobby interior" 
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 luxury-gradient opacity-80"></div>
        <div className="relative z-10 text-center text-primary-foreground max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6">
            {pageContent?.hero?.title || "Experience"}
            <span className="block text-accent">Luxury</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90">
            {pageContent?.hero?.subtitle || "World-class amenities, exceptional service, and unforgettable memories await you"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button size="lg" className="button-luxury text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-target" asChild>
              <a href="/book">
                Book Your Stay
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/10 border-white/30 text-white hover:bg-white/20 touch-target" asChild>
              <a href="/rooms">
                Explore Rooms
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {pageContent?.about?.title || "Complete Hotel Management Solution"}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              {pageContent?.about?.description || "Our comprehensive system handles every aspect of hotel operations with modern, touch-friendly interfaces"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Room Types Section */}
      <section id="rooms" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Available Rooms
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose from our selection of elegantly appointed rooms and suites
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="card-luxury overflow-hidden">
                  <Skeleton className="h-32 sm:h-40 lg:h-48 w-full" />
                  <CardHeader className="p-3 sm:p-4 lg:p-6">
                    <Skeleton className="h-5 sm:h-6 w-3/4" />
                    <Skeleton className="h-3 sm:h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                    <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-2/3 mb-4" />
                    <Skeleton className="h-8 sm:h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {availableRooms.map((room) => (
                <RoomCard key={room.id} room={room} formatCurrency={formatCurrency} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No rooms currently available</h3>
                <p className="text-muted-foreground mb-6">
                  All our rooms are currently occupied. Please check back later or contact us for assistance.
                </p>
                <Button asChild>
                  <a href="/rooms">View All Rooms</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {availableRooms.length > 0 && (
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <a href="/rooms">
                  View All Rooms
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              World-Class Amenities
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              Everything you need for a perfect stay
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {amenities.map((amenity, index) => (
              <AmenityCard key={index} amenity={amenity} />
            ))}
          </div>
        </div>
      </section>

      {/* Management System Demo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Try Our Management System
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience the power of our comprehensive hotel management platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-luxury p-8 text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Hotel Services Demo</h3>
              <p className="text-muted-foreground mb-6">
                Try our touch-friendly point of sale system designed for restaurants, bars, and retail operations
              </p>
              <Button className="button-luxury" asChild>
                <a href="/pos">
                  Try Hotel Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>
            
            <Card className="card-luxury p-8 text-center">
              <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Hotel className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Admin Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Explore our comprehensive dashboard for managing bookings, rooms, guests, and operations
              </p>
              <Button className="button-luxury" asChild>
                <a href="/book">
                  Book Your Stay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {pageContent?.contact?.title || "Get In Touch"}
            </h2>
            <p className="text-xl text-muted-foreground">
              {pageContent?.contact?.description || "Ready to experience luxury? Contact us today"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="card-luxury text-center p-6">
              <Phone className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-muted-foreground">{settings.hotel_phone || "+1 (555) 123-4567"}</p>
            </Card>
            
            <Card className="card-luxury text-center p-6">
              <Mail className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-muted-foreground">{settings.hotel_email || "info@hotel.com"}</p>
            </Card>
            
            <Card className="card-luxury text-center p-6">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-bold mb-2">Address</h3>
              <p className="text-muted-foreground">{settings.hotel_address || "Contact us for location details"}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-lg">
                <Hotel className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{settings.hotel_name}</h3>
                <p className="text-sm opacity-80">Management System</p>
              </div>
            </div>
            <p className="opacity-80">
              © 2025 Dserverhost Nigeria Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;