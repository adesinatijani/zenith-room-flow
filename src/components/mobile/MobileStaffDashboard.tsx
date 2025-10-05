import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Hotel, Users, Calendar, DollarSign, 
  Bell, Menu, LogOut, Settings,
  Bed, Coffee, Utensils, Dumbbell
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const quickActions = [
  { icon: Bed, label: 'Rooms', href: '/rooms', color: 'bg-blue-500' },
  { icon: Users, label: 'Guests', href: '/guests', color: 'bg-green-500' },
  { icon: Coffee, label: 'POS', href: '/pos', color: 'bg-orange-500' },
  { icon: Utensils, label: 'Menu', href: '/menu', color: 'bg-purple-500' },
  { icon: Calendar, label: 'Bookings', href: '/booking-management', color: 'bg-red-500' },
  { icon: Dumbbell, label: 'Gym', href: '/gym', color: 'bg-teal-500' },
];

const notifications = [
  { id: 1, type: 'booking', message: 'New booking for Room 205', time: '5 min ago' },
  { id: 2, type: 'maintenance', message: 'Room 103 maintenance completed', time: '15 min ago' },
  { id: 3, type: 'checkout', message: 'Guest checked out from Room 301', time: '1 hour ago' },
];

export default function MobileStaffDashboard() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { profile, signOut, userRoles } = useAuth();

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const handleQuickAction = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Hotel className="h-5 w-5" />
                    Staff Portal
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-lg font-semibold">ALOKOLODO HOTELS</h1>
              <p className="text-xs text-muted-foreground">Staff Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-lg">
                  {profile?.first_name?.[0] || 'S'}
                </span>
              </div>
              <div>
                <h2 className="font-semibold">
                  Welcome, {profile?.first_name || 'Staff'}
                </h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {userRoles[0] || 'Staff Member'} • {profile?.department || 'General'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 pb-4">
        <h3 className="font-medium mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Card 
              key={action.label} 
              className="cursor-pointer transition-all hover:shadow-md active:scale-95"
              onClick={() => handleQuickAction(action.href)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-xs font-medium">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="px-4 pb-6">
        <h3 className="font-medium mb-3">Recent Updates</h3>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card key={notification.id} className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium flex-1 pr-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}