import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Hotel,
  ShoppingCart,
  PieChart,
  Activity,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';
import { useFinancialSummary, useAccountEntries } from "@/hooks/useAccounting";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

const Analytics = () => {
  const { data: financialSummary } = useFinancialSummary();
  const { data: accountEntries } = useAccountEntries();
  const { rooms, bookings } = useRoomsDB();
  
  // Fetch orders for restaurant revenue
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'completed');
      if (error) throw error;
      return data;
    }
  });

  // Calculate monthly revenue trends
  const revenueData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Calculate room revenue
      const roomRevenue = bookings
        ?.filter(b => {
          const checkIn = new Date(b.check_in_date);
          return checkIn >= monthStart && checkIn <= monthEnd && b.payment_status === 'paid';
        })
        .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
      
      // Calculate restaurant revenue
      const restaurantRevenue = orders
        ?.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= monthStart && orderDate <= monthEnd;
        })
        .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      
      const bookingCount = bookings
        ?.filter(b => {
          const checkIn = new Date(b.check_in_date);
          return checkIn >= monthStart && checkIn <= monthEnd;
        }).length || 0;
      
      last6Months.push({
        month: monthName,
        revenue: Math.round(roomRevenue + restaurantRevenue),
        bookings: bookingCount
      });
    }
    
    return last6Months;
  }, [bookings, orders]);

  // Calculate room type performance
  const roomTypeData = useMemo(() => {
    const roomTypes = ['standard', 'deluxe', 'suite', 'executive'];
    
    return roomTypes.map(type => {
      const roomsOfType = rooms?.filter(r => r.room_type.toLowerCase() === type) || [];
      const totalRooms = roomsOfType.length;
      const occupiedRooms = roomsOfType.filter(r => r.status === 'occupied').length;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
      
      // Calculate revenue for this room type
      const revenue = bookings
        ?.filter(b => {
          const room = rooms?.find(r => r.id === b.room_id);
          return room?.room_type.toLowerCase() === type && b.payment_status === 'paid';
        })
        .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
      
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        occupancy: occupancyRate,
        revenue: Math.round(revenue)
      };
    }).filter(data => data.revenue > 0 || data.occupancy > 0);
  }, [rooms, bookings]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRooms = rooms?.length || 1;
    const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    // Average Daily Rate (total revenue / total nights booked)
    const totalRevenue = bookings
      ?.filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
    const totalNights = bookings
      ?.filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.nights, 0) || 1;
    const adr = Math.round(totalRevenue / totalNights);
    
    // RevPAR (Revenue Per Available Room)
    const revpar = Math.round(totalRevenue / totalRooms);
    
    // Total revenue including restaurant
    const restaurantRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const combinedRevenue = totalRevenue + restaurantRevenue;
    
    return [
      {
        title: "Total Revenue",
        value: `$${combinedRevenue.toLocaleString()}`,
        change: "+15.3%",
        icon: DollarSign,
        trend: "up"
      },
      {
        title: "Occupancy Rate",
        value: `${occupancyRate}%`,
        change: `${occupiedRooms}/${totalRooms} rooms`,
        icon: Hotel,
        trend: occupancyRate > 70 ? "up" : "neutral"
      },
      {
        title: "Average Daily Rate",
        value: `$${adr}`,
        change: "Per night",
        icon: TrendingUp,
        trend: "up"
      },
      {
        title: "Revenue Per Room",
        value: `$${revpar}`,
        change: "RevPAR",
        icon: Activity,
        trend: "up"
      }
    ];
  }, [rooms, bookings, orders]);

  const customerSegmentData = [
    { name: 'Room Bookings', value: 60, color: 'hsl(var(--primary))' },
    { name: 'Restaurant', value: 30, color: 'hsl(var(--secondary))' },
    { name: 'Other Services', value: 10, color: 'hsl(var(--accent))' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and performance metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-sm text-green-600">{kpi.change}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy Trends</TabsTrigger>
          <TabsTrigger value="customer">Customer Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription>Revenue performance over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Room Type Performance
                </CardTitle>
                <CardDescription>Revenue by room category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roomTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Occupancy by Room Type
              </CardTitle>
              <CardDescription>Current occupancy rates across room categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roomTypeData.map((room, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{room.type}</span>
                      <span className="text-sm text-muted-foreground">{room.occupancy}%</span>
                    </div>
                    <Progress value={room.occupancy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Customer Segments
                </CardTitle>
                <CardDescription>Distribution of guest types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={customerSegmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSegmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {customerSegmentData.map((segment, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm">{segment.name} ({segment.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
                <CardDescription>Important performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Average Length of Stay</span>
                    <span className="text-xl font-bold">3.2 nights</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Repeat Guest Rate</span>
                    <span className="text-xl font-bold">28%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Cancellation Rate</span>
                    <span className="text-xl font-bold">12%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">No-Show Rate</span>
                    <span className="text-xl font-bold">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Scorecard
              </CardTitle>
              <CardDescription>Overall business performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Financial Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Revenue Growth</span>
                      <span className="text-green-600 font-medium">+15.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profit Margin</span>
                      <span className="text-green-600 font-medium">32%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cost Per Acquisition</span>
                      <span className="font-medium">$45</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Operational Excellence</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Staff Efficiency</span>
                      <span className="text-green-600 font-medium">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Service Quality Score</span>
                      <span className="text-green-600 font-medium">4.7/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Response Time</span>
                      <span className="font-medium">2.3 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;