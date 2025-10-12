import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { 
  useAccountEntries, 
  useFinancialSummary, 
  useBudgets,
  AccountEntry as AccountEntryType 
} from "@/hooks/useAccounting";
import { AddAccountEntryModal } from "@/components/accounting/AddAccountEntryModal";
import { ExportDataModal } from "@/components/accounting/ExportDataModal";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  CreditCard,
  Receipt,
  Target,
  AlertCircle,
  Loader2
} from "lucide-react";

const AccountingModule = () => {
  const { toast } = useToast();
  const { formatCurrency } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { data: entries = [], isLoading: entriesLoading } = useAccountEntries();
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();

  // Previous period data for comparison
  const previousPeriod = {
    revenue: 52100.00,
    expenses: 31200.00,
    netIncome: 20900.00,
    assets: 475000.00,
    liabilities: 130000.00,
    equity: 345000.00
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getCategoryColor = (type: string) => {
    const colors = {
      revenue: 'bg-success text-success-foreground',
      expense: 'bg-destructive text-destructive-foreground',
      asset: 'bg-accent text-accent-foreground',
      liability: 'bg-warning text-warning-foreground',
      equity: 'bg-primary text-primary-foreground'
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'reconciled': return 'bg-accent text-accent-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated and is ready for download.`,
    });
  };

  const handleExportData = () => {
    setIsExportModalOpen(true);
  };

  const revenueChange = summary ? calculateChange(summary.revenue, previousPeriod.revenue) : 0;
  const expenseChange = summary ? calculateChange(summary.expenses, previousPeriod.expenses) : 0;
  const netIncomeChange = summary ? calculateChange(summary.netIncome, previousPeriod.netIncome) : 0;

  if (summaryLoading || entriesLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounting Module</h1>
          <p className="text-muted-foreground">Financial management, reports, and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="button-luxury" onClick={() => setIsAddEntryModalOpen(true)}>
            <Receipt className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="budgets">Budget Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(summary?.revenue || 0)}
                </div>
                <p className={`text-xs flex items-center gap-1 ${revenueChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(revenueChange).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(summary?.expenses || 0)}
                </div>
                <p className={`text-xs flex items-center gap-1 ${expenseChange <= 0 ? 'text-success' : 'text-destructive'}`}>
                  {expenseChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {Math.abs(expenseChange).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Net Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {formatCurrency(summary?.netIncome || 0)}
                </div>
                <p className={`text-xs flex items-center gap-1 ${netIncomeChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netIncomeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(netIncomeChange).toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Balance Sheet Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.assets || 0)}</div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Assets</span>
                    <span>{formatCurrency(Math.round((summary?.assets || 0) * 0.4))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fixed Assets</span>
                    <span>{formatCurrency(Math.round((summary?.assets || 0) * 0.6))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.liabilities || 0)}</div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Liabilities</span>
                    <span>{formatCurrency(Math.round((summary?.liabilities || 0) * 0.4))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Long-term Debt</span>
                    <span>{formatCurrency(Math.round((summary?.liabilities || 0) * 0.6))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.equity || 0)}</div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retained Earnings</span>
                    <span>{formatCurrency(Math.round((summary?.equity || 0) * 0.8))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capital</span>
                    <span>{formatCurrency(Math.round((summary?.equity || 0) * 0.2))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleGenerateReport("P&L")}>
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">P&L Statement</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleGenerateReport("Balance Sheet")}>
                  <PieChart className="h-6 w-6" />
                  <span className="text-sm">Balance Sheet</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => handleGenerateReport("Cash Flow")}>
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm">Cash Flow</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Monthly Close</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <div className="grid gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="card-luxury">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{entry.description}</h3>
                        <p className="text-muted-foreground">{entry.entry_date} • {entry.reference_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${entry.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {entry.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(entry.amount))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getCategoryColor(entry.account_categories?.type || 'asset')}>
                          {(entry.account_categories?.type || 'ASSET').toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{entry.sub_category || entry.account_categories?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reference</p>
                      <p className="font-medium">{entry.reference_number}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>Current Period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold">Revenue</span>
                    <span className="font-bold text-success">{formatCurrency(summary?.revenue || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold">Expenses</span>
                    <span className="font-bold text-destructive">{formatCurrency(summary?.expenses || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-accent">
                    <span className="font-bold text-lg">Net Income</span>
                    <span className="font-bold text-xl text-accent">{formatCurrency(summary?.netIncome || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Current Period</span>
                    <span className="font-bold">{formatCurrency(summary?.revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Period</span>
                    <span>{formatCurrency(previousPeriod.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth Rate</span>
                    <span className={revenueChange >= 0 ? 'text-success' : 'text-destructive'}>
                      {revenueChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Current Period</span>
                    <span className="font-bold">{formatCurrency(summary?.expenses || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Period</span>
                    <span>{formatCurrency(previousPeriod.expenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change Rate</span>
                    <span className={expenseChange <= 0 ? 'text-success' : 'text-destructive'}>
                      {expenseChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Current fiscal year performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Revenue Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Actual Revenue</span>
                        <span className="font-bold text-success">${summary?.revenue.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Budget Target</span>
                        <span className="font-bold">$48,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Expense Management</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Actual Expenses</span>
                        <span className="font-bold text-destructive">${summary?.expenses.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Budget Limit</span>
                        <span className="font-bold">$30,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Budget Alerts</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>• Monitor revenue targets for optimal performance</p>
                    <p>• Expense management within acceptable range</p>
                    <p>• Overall profitability tracking well</p>
                  </div>
                </div>

                <Button className="button-luxury">
                  <Target className="h-4 w-4 mr-2" />
                  Update Budget Targets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AddAccountEntryModal 
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
      />
      
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        entries={entries}
        summary={summary}
        budgets={budgets}
      />
    </div>
  );
};

export default AccountingModule;