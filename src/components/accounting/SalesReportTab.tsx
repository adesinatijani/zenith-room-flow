import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Filter,
  Download,
  Loader2,
  Wine,
  Utensils,
  Bed
} from "lucide-react";

interface SaleItem {
  id: string;
  item_name: string;
  item_category: string;
  quantity: number;
  price: number;
  cost_price: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  profit_margin: number;
  order_date: string;
  payment_method: string;
  guest_name: string;
}

interface RoomSale {
  id: string;
  room_number: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_amount: number;
  payment_status: string;
}

export const SalesReportTab = () => {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<SaleItem[]>([]);
  const [roomSales, setRoomSales] = useState<RoomSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  useEffect(() => {
    fetchSalesData();
    fetchRoomSales();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      // Fetch all paid orders with their items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          payment_method,
          guest_name,
          order_items (
            id,
            item_name,
            item_category,
            quantity,
            price
          )
        `)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get menu items with recipe costs
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          name, 
          cost_price,
          recipe_id,
          recipes (
            id,
            cost
          )
        `);

      if (menuError) throw menuError;

      // Process sales data
      const processedSales: SaleItem[] = [];
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const menuItem = menuItems?.find(mi => mi.name === item.item_name);
          
          // Use recipe cost if available, otherwise use cost_price
          const costPrice = menuItem?.recipes?.cost || menuItem?.cost_price || 0;
          const totalRevenue = item.price * item.quantity;
          const totalCost = costPrice * item.quantity;
          const profit = totalRevenue - totalCost;
          const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

          processedSales.push({
            id: item.id,
            item_name: item.item_name,
            item_category: item.item_category,
            quantity: item.quantity,
            price: item.price,
            cost_price: costPrice,
            total_revenue: totalRevenue,
            total_cost: totalCost,
            profit: profit,
            profit_margin: profitMargin,
            order_date: order.created_at,
            payment_method: order.payment_method || 'N/A',
            guest_name: order.guest_name
          });
        });
      });

      setSalesData(processedSales);
    } catch (error: any) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomSales = async () => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          id,
          guest_name,
          check_in_date,
          check_out_date,
          nights,
          total_amount,
          payment_status,
          rooms (
            room_number
          )
        `)
        .eq('payment_status', 'paid')
        .order('check_in_date', { ascending: false });

      if (error) throw error;

      const formatted = data?.map(booking => ({
        id: booking.id,
        room_number: (booking.rooms as any)?.room_number || 'N/A',
        guest_name: booking.guest_name,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        nights: booking.nights,
        total_amount: booking.total_amount,
        payment_status: booking.payment_status
      })) || [];

      setRoomSales(formatted);
    } catch (error) {
      console.error('Error fetching room sales:', error);
    }
  };

  const filteredSales = salesData.filter(sale => {
    if (filterCategory !== "all" && sale.item_category !== filterCategory) return false;
    if (filterDateFrom && new Date(sale.order_date) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(sale.order_date) > new Date(filterDateTo)) return false;
    return true;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_revenue, 0);
  const totalCost = filteredSales.reduce((sum, sale) => sum + sale.total_cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalRoomRevenue = roomSales.reduce((sum, room) => sum + room.total_amount, 0);
  const overallRevenue = totalRevenue + totalRoomRevenue;
  const overallProfit = totalProfit + totalRoomRevenue; // Room bookings are typically 100% profit

  const categories = [...new Set(salesData.map(s => s.item_category))];

  const exportToCSV = () => {
    const headers = ['Date', 'Item', 'Category', 'Quantity', 'Price', 'Cost', 'Revenue', 'Profit', 'Margin %', 'Guest', 'Payment'];
    const rows = filteredSales.map(sale => [
      format(new Date(sale.order_date), 'yyyy-MM-dd HH:mm'),
      sale.item_name,
      sale.item_category,
      sale.quantity,
      sale.price.toFixed(2),
      sale.cost_price.toFixed(2),
      sale.total_revenue.toFixed(2),
      sale.profit.toFixed(2),
      sale.profit_margin.toFixed(1),
      sale.guest_name,
      sale.payment_method
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();

    toast({
      title: "Export Complete",
      description: "Sales report has been downloaded"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${overallRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              POS: ${totalRevenue.toFixed(2)} | Rooms: ${totalRoomRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ${overallProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Margin: {overallRevenue > 0 ? ((overallProfit / overallRevenue) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Items Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredSales.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Room Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomSales.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalRoomRevenue.toFixed(2)} revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input 
                type="date" 
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input 
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={exportToCSV} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POS Sales Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            POS Sales Details
          </CardTitle>
          <CardDescription>Detailed breakdown of all items sold with profit analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    {sale.item_category.includes('Wine') || sale.item_category.includes('Beverage') ? (
                      <Wine className="h-5 w-5 text-white" />
                    ) : (
                      <Utensils className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{sale.item_name}</h4>
                      <Badge variant="outline">{sale.item_category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{format(new Date(sale.order_date), 'MMM dd, yyyy HH:mm')}</span>
                      <span>•</span>
                      <span>{sale.guest_name}</span>
                      <span>•</span>
                      <span>Qty: {sale.quantity}</span>
                      <span>•</span>
                      <span>{sale.payment_method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium">${sale.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-medium text-success">${sale.total_revenue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium text-destructive">${sale.total_cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit</p>
                      <p className="font-bold text-accent">
                        ${sale.profit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.profit_margin.toFixed(1)}% margin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Room Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Room Bookings Revenue
          </CardTitle>
          <CardDescription>All paid room bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roomSales.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Bed className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Room {room.room_number}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{room.guest_name}</span>
                      <span>•</span>
                      <span>{format(new Date(room.check_in_date), 'MMM dd')} - {format(new Date(room.check_out_date), 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span>{room.nights} night{room.nights !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">
                    ${room.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <Badge className="mt-1">{room.payment_status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
