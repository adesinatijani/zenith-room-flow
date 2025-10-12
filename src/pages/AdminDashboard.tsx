import { useState, useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Hotel,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  FileEdit,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NetworkStatus } from "@/components/ui/network-status";
import GlobalInventoryNotifications from "@/components/inventory/GlobalInventoryNotifications";
import HotelSettingsEditor from "@/components/settings/HotelSettingsEditor";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useDailyStats } from "@/hooks/useDailyStats";
import { useClearSalesData } from "@/hooks/useClearSalesData";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { formatCurrency } = useGlobalSettings();
  const { rooms, bookings } = useRoomsDB();
  const { data: dailyStats } = useDailyStats();
  const clearSalesData = useClearSalesData();

  // Calculate real stats - DAILY ONLY (resets at midnight)
  const stats = useMemo(() => {
    const totalRooms = rooms?.length || 0;
    const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
    const activeBookings = bookings?.filter(b => b.booking_status === 'active').length || 0;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return [
      {
        title: "Today's Revenue",
        value: formatCurrency(dailyStats?.totalRevenue || 0),
        change: "Resets at midnight",
        icon: DollarSign,
        color: "text-green-600",
        bg: "bg-green-100"
      },
      {
        title: "Today's Bookings",
        value: (dailyStats?.bookingCount || 0).toString(),
        change: formatCurrency(dailyStats?.bookingRevenue || 0),
        icon: Calendar,
        color: "text-blue-600",
        bg: "bg-blue-100"
      },
      {
        title: "Today's POS Sales",
        value: formatCurrency(dailyStats?.ordersRevenue || 0),
        change: `${dailyStats?.ordersCount || 0} orders`,
        icon: ShoppingCart,
        color: "text-orange-600",
        bg: "bg-orange-100"
      },
      {
        title: "Today's Gym Revenue",
        value: formatCurrency(dailyStats?.gymRevenue || 0),
        change: `${dailyStats?.gymSessionsCount || 0} sessions`,
        icon: Hotel,
        color: "text-purple-600",
        bg: "bg-purple-100"
      }
    ];
  }, [rooms, bookings, dailyStats, formatCurrency]);

  // Get recent bookings from database
  const recentBookings = useMemo(() => {
    return (bookings || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map(booking => {
        const room = rooms?.find(r => r.id === booking.room_id);
        const checkInDate = new Date(booking.check_in_date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let checkinDisplay = checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (checkInDate.toDateString() === today.toDateString()) {
          checkinDisplay = "Today";
        } else if (checkInDate.toDateString() === tomorrow.toDateString()) {
          checkinDisplay = "Tomorrow";
        }

        return {
          id: booking.id,
          guest: booking.guest_name,
          room: room ? `${room.room_type} ${room.room_number}` : 'Unknown Room',
          checkin: checkinDisplay,
          status: booking.booking_status
        };
      });
  }, [bookings, rooms]);

  // Calculate room status from database
  const roomStatus = useMemo(() => {
    const occupied = rooms?.filter(r => r.status === 'occupied').length || 0;
    const available = rooms?.filter(r => r.status === 'available').length || 0;
    const maintenance = rooms?.filter(r => r.status === 'maintenance').length || 0;
    const cleaning = rooms?.filter(r => r.status === 'cleaning').length || 0;

    return [
      { type: "Occupied", count: occupied, color: "bg-green-500" },
      { type: "Available", count: available, color: "bg-blue-500" },
      { type: "Maintenance", count: maintenance, color: "bg-orange-500" },
      { type: "Cleaning", count: cleaning, color: "bg-yellow-500" },
    ];
  }, [rooms]);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your hotel.</p>
        </div>
        <div className="flex items-center gap-3">
          <NetworkStatus showDetails />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Sales
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all sales data including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All paid orders (restaurant/bar)</li>
                    <li>All gym/game sessions</li>
                    <li>All order items</li>
                    <li>All accounting journal entries</li>
                    <li>Room bookings will be marked as cancelled</li>
                  </ul>
                  <p className="mt-2 font-semibold text-destructive">This action cannot be undone!</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearSalesData.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => navigate('/admin/content')}>
            <FileEdit className="h-4 w-4 mr-2" />
            Edit Content
          </Button>
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Hotel Settings
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/reports')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button className="button-luxury" onClick={() => navigate('/admin/analytics')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Global Inventory Notifications */}
      <GlobalInventoryNotifications 
        userRole="admin" 
        onItemClick={(itemId) => {
          // Navigate to inventory management with item focus
          window.location.href = `/admin/inventory?focus=${itemId}`;
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest guest reservations and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.guest}</p>
                      <p className="text-sm text-muted-foreground">{booking.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        booking.status === "active" ? "default" : 
                        booking.status === "completed" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{booking.checkin}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Room Status */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Room Status Overview
            </CardTitle>
            <CardDescription>Current status of all hotel rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roomStatus.map((status, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <span className="font-medium">{status.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{status.count} rooms</span>
                  </div>
                  <Progress value={(status.count / 125) * 100} className="h-2" />
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Occupancy Rate</span>
                <span className="text-2xl font-bold text-accent">
                  {stats[2].change}
                </span>
              </div>
              <Progress value={parseFloat(stats[2].change)} className="h-3 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/admin/bookings')}
            >
              <CheckCircle className="h-6 w-6" />
              <span className="text-sm">Check-in Guest</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/admin/housekeeping')}
            >
              <Clock className="h-6 w-6" />
              <span className="text-sm">Housekeeping</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/admin/rooms')}
            >
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Maintenance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/admin/reports')}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <HotelSettingsEditor isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default AdminDashboard;