import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Users,
  DollarSign,
  Hotel,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Clock,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Eye,
  Archive
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReports } from "@/hooks/useReports";
import { useState } from "react";
import { format } from "date-fns";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  const {
    financialData,
    guestData,
    operationalData,
    savedReports,
    financialLoading,
    guestLoading,
    operationalLoading,
    savedReportsLoading,
    isGenerating,
    generateReport,
    downloadReport,
    refetchSavedReports
  } = useReports();

  const reportCategories = [
    {
      title: "Financial Reports",
      description: "Revenue, expenses, and financial analytics",
      icon: DollarSign,
      loading: financialLoading,
      reports: [
        { 
          name: "Daily Revenue Report", 
          description: "Daily sales and revenue breakdown", 
          lastGenerated: savedReports?.find(r => r.report_type === 'daily_revenue_report')?.generated_at || null,
          dataCount: financialData?.orders?.length || 0
        },
        { 
          name: "Monthly P&L Statement", 
          description: "Profit and loss analysis", 
          lastGenerated: savedReports?.find(r => r.report_type === 'monthly_p&l_statement')?.generated_at || null,
          dataCount: financialData?.accountEntries?.length || 0
        },
        { 
          name: "Cash Flow Report", 
          description: "Cash inflow and outflow tracking", 
          lastGenerated: savedReports?.find(r => r.report_type === 'cash_flow_report')?.generated_at || null,
          dataCount: financialData?.accountEntries?.filter(e => e.status === 'posted')?.length || 0
        },
        { 
          name: "Tax Summary Report", 
          description: "Tax calculations and summaries", 
          lastGenerated: savedReports?.find(r => r.report_type === 'tax_summary_report')?.generated_at || null,
          dataCount: financialData?.orders?.filter(o => o.tax_amount > 0)?.length || 0
        },
      ]
    },
    {
      title: "Occupancy Reports",
      description: "Room availability and booking analytics",
      icon: Hotel,
      loading: guestLoading,
      reports: [
        { 
          name: "Occupancy Rate Report", 
          description: "Room occupancy trends and statistics", 
          lastGenerated: savedReports?.find(r => r.report_type === 'occupancy_rate_report')?.generated_at || null,
          dataCount: guestData?.filter(o => o.guest_type === 'hotel')?.length || 0
        },
        { 
          name: "ADR & RevPAR Report", 
          description: "Average Daily Rate and Revenue per Available Room", 
          lastGenerated: savedReports?.find(r => r.report_type === 'adr_&_revpar_report')?.generated_at || null,
          dataCount: guestData?.length || 0
        },
        { 
          name: "Booking Forecast", 
          description: "Future booking predictions and trends", 
          lastGenerated: savedReports?.find(r => r.report_type === 'booking_forecast')?.generated_at || null,
          dataCount: guestData?.filter(o => o.status === 'active')?.length || 0
        },
        { 
          name: "Cancellation Analysis", 
          description: "Booking cancellation patterns", 
          lastGenerated: savedReports?.find(r => r.report_type === 'cancellation_analysis')?.generated_at || null,
          dataCount: guestData?.filter(o => o.status === 'cancelled')?.length || 0
        },
      ]
    },
    {
      title: "Guest Reports",
      description: "Customer analytics and satisfaction metrics",
      icon: Users,
      loading: guestLoading,
      reports: [
        { 
          name: "Guest Demographics", 
          description: "Customer profile and segmentation analysis", 
          lastGenerated: savedReports?.find(r => r.report_type === 'guest_demographics')?.generated_at || null,
          dataCount: guestData?.length || 0
        },
        { 
          name: "Guest Satisfaction Survey", 
          description: "Customer feedback and ratings analysis", 
          lastGenerated: savedReports?.find(r => r.report_type === 'guest_satisfaction_survey')?.generated_at || null,
          dataCount: guestData?.length || 0
        },
        { 
          name: "Loyalty Program Report", 
          description: "Member activity and rewards tracking", 
          lastGenerated: savedReports?.find(r => r.report_type === 'loyalty_program_report')?.generated_at || null,
          dataCount: 0
        },
        { 
          name: "Guest History Report", 
          description: "Individual guest stay patterns", 
          lastGenerated: savedReports?.find(r => r.report_type === 'guest_history_report')?.generated_at || null,
          dataCount: guestData?.length || 0
        },
      ]
    },
    {
      title: "Operational Reports",
      description: "Staff performance and operational metrics",
      icon: BarChart3,
      loading: operationalLoading,
      reports: [
        { 
          name: "Staff Performance Report", 
          description: "Employee productivity and KPI tracking", 
          lastGenerated: savedReports?.find(r => r.report_type === 'staff_performance_report')?.generated_at || null,
          dataCount: operationalData?.employees?.length || 0
        },
        { 
          name: "Housekeeping Efficiency", 
          description: "Room cleaning and maintenance metrics", 
          lastGenerated: savedReports?.find(r => r.report_type === 'housekeeping_efficiency')?.generated_at || null,
          dataCount: operationalData?.employees?.length || 0
        },
        { 
          name: "Inventory Usage Report", 
          description: "Stock levels and consumption patterns", 
          lastGenerated: savedReports?.find(r => r.report_type === 'inventory_usage_report')?.generated_at || null,
          dataCount: operationalData?.inventory?.length || 0
        },
        { 
          name: "Maintenance Log Report", 
          description: "Equipment and facility maintenance tracking", 
          lastGenerated: savedReports?.find(r => r.report_type === 'maintenance_log_report')?.generated_at || null,
          dataCount: operationalData?.employees?.length || 0
        },
      ]
    }
  ];

  const quickReports = [
    { 
      name: "Today's Summary", 
      icon: Clock, 
      color: "bg-blue-100 text-blue-600",
      period: "today",
      dataCount: guestData?.filter(o => {
        const today = new Date().toISOString().split('T')[0];
        return o.created_at?.startsWith(today);
      })?.length || 0
    },
    { 
      name: "This Week", 
      icon: Calendar, 
      color: "bg-green-100 text-green-600",
      period: "last-7-days",
      dataCount: guestData?.length || 0
    },
    { 
      name: "This Month", 
      icon: TrendingUp, 
      color: "bg-purple-100 text-purple-600",
      period: "this-month",
      dataCount: financialData?.orders?.length || 0
    },
    { 
      name: "Year to Date", 
      icon: BarChart3, 
      color: "bg-orange-100 text-orange-600",
      period: "this-year",
      dataCount: (financialData?.orders?.length || 0) + (operationalData?.employees?.length || 0)
    },
  ];

  const handleGenerateReport = async (reportName: string) => {
    try {
      const period = selectedPeriod === 'custom' && customStartDate && customEndDate 
        ? `${customStartDate} to ${customEndDate}` 
        : selectedPeriod;
      
      await generateReport(reportName, period, selectedFormat);
      refetchSavedReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownloadReport = async (reportName: string) => {
    try {
      await downloadReport(reportName, selectedFormat);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleQuickReport = async (reportName: string, period: string) => {
    try {
      await generateReport(`${reportName} Report`, period, selectedFormat);
      refetchSavedReports();
    } catch (error) {
      console.error('Failed to generate quick report:', error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports Center</h1>
          <p className="text-muted-foreground">Generate, schedule, and download comprehensive business reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled={savedReportsLoading} onClick={() => refetchSavedReports()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${savedReportsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            {savedReports?.length || 0} Saved Reports
          </Badge>
          <Button className="button-luxury">
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Reports
          </CardTitle>
          <CardDescription>Generate instant reports for common time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickReports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 flex-col gap-2 relative"
                  onClick={() => handleQuickReport(report.name, report.period)}
                  disabled={isGenerating}
                >
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{report.name}</span>
                  <Badge variant="secondary" className="text-xs absolute top-1 right-1">
                    {report.dataCount}
                  </Badge>
                  {isGenerating && (
                    <Loader2 className="h-3 w-3 animate-spin absolute bottom-1 right-1" />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <Card className="card-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>Configure report parameters and format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Date Range</label>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  placeholder="Start Date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  disabled={selectedPeriod !== 'custom'}
                />
                <Input 
                  type="date" 
                  placeholder="End Date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  disabled={selectedPeriod !== 'custom'}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="guest">Guest</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>

        {reportCategories.map((category, categoryIndex) => (
          <TabsContent 
            key={categoryIndex} 
            value={category.title.toLowerCase().split(' ')[0]} 
            className="space-y-6"
          >
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {category.reports.map((report, reportIndex) => (
                    <div 
                      key={reportIndex}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg relative">
                          <FileText className="h-4 w-4 text-primary" />
                          {category.loading && (
                            <Loader2 className="h-3 w-3 animate-spin absolute -top-1 -right-1" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {report.lastGenerated ? (
                              <Badge variant="secondary" className="text-xs">
                                Last: {format(new Date(report.lastGenerated), 'MMM dd, HH:mm')}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Never generated
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {report.dataCount} records
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.lastGenerated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // View report details
                              console.log('View report:', report.name);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.name)}
                          disabled={!report.lastGenerated || isGenerating}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          className="button-luxury"
                          onClick={() => handleGenerateReport(report.name)}
                          disabled={isGenerating || category.loading}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="h-3 w-3 mr-1" />
                          )}
                          Generate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Saved Reports Section */}
      {savedReports && savedReports.length > 0 && (
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Recent Generated Reports
            </CardTitle>
            <CardDescription>Recently generated reports available for download</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {savedReports.slice(0, 5).map((report, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">
                        {report.report_type.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {report.period_start} to {report.period_end}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Generated: {format(new Date(report.generated_at), 'MMM dd, HH:mm')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report.report_type.replace(/_/g, ' '))}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;