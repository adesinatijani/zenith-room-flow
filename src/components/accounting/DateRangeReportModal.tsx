import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { CalendarIcon, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DateRangeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DateRangeReportModal = ({ isOpen, onClose }: DateRangeReportModalProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportType, setReportType] = useState<string>("all");
  const { formatCurrency } = useGlobalSettings();
  const { toast } = useToast();

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['date-range-report', startDate, endDate, reportType],
    queryFn: async () => {
      if (!startDate || !endDate) return null;

      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      let bookingRevenue = 0;
      let ordersRevenue = 0;
      let gymRevenue = 0;

      if (reportType === 'all' || reportType === 'bookings') {
        const { data: bookings } = await supabase
          .from('room_bookings')
          .select('total_amount')
          .gte('created_at', startStr)
          .lte('created_at', endStr)
          .eq('payment_status', 'paid');
        
        bookingRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
      }

      if (reportType === 'all' || reportType === 'orders') {
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', startStr)
          .lte('created_at', endStr)
          .eq('status', 'paid');
        
        ordersRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      }

      if (reportType === 'all' || reportType === 'gym') {
        const { data: gymSessions } = await supabase
          .from('game_sessions')
          .select('total_amount')
          .gte('created_at', startStr)
          .lte('created_at', endStr)
          .eq('payment_status', 'paid');
        
        gymRevenue = gymSessions?.reduce((sum, g) => sum + Number(g.total_amount), 0) || 0;
      }

      return {
        bookingRevenue,
        ordersRevenue,
        gymRevenue,
        totalRevenue: bookingRevenue + ordersRevenue + gymRevenue,
      };
    },
    enabled: !!startDate && !!endDate,
  });

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }
    refetch();
  };

  const handleDownloadReport = () => {
    if (!reportData) return;

    const csvContent = [
      'Report Type,Start Date,End Date,Booking Revenue,Orders Revenue,Gym Revenue,Total Revenue',
      `${reportType},${format(startDate!, 'yyyy-MM-dd')},${format(endDate!, 'yyyy-MM-dd')},${reportData.bookingRevenue},${reportData.ordersRevenue},${reportData.gymRevenue},${reportData.totalRevenue}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${format(startDate!, 'yyyy-MM-dd')}-to-${format(endDate!, 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Report downloaded successfully",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Sales Report</DialogTitle>
          <DialogDescription>
            Select date range and report type to generate a custom sales report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
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
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales</SelectItem>
                <SelectItem value="bookings">Bookings Only</SelectItem>
                <SelectItem value="orders">Restaurant/Bar Only</SelectItem>
                <SelectItem value="gym">Gym/Game Center Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateReport} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>

          {reportData && (
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-semibold">Report Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(reportData.bookingRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Restaurant/Bar Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(reportData.ordersRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gym/Game Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(reportData.gymRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(reportData.totalRevenue)}</p>
                </div>
              </div>

              <Button onClick={handleDownloadReport} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Report (CSV)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
