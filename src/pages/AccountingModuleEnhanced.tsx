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

  const formatChange = (current: number, previous: number) => {
    const change = calculateChange(current, previous);
    const isPositive = change > 0;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-green-600" : "text-red-600"
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'draft': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  if (entriesLoading || summaryLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading accounting data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounting Module</h1>
          <p className="text-muted-foreground">Financial management and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setIsAddEntryModalOpen(true)}>
            <Receipt className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="budgets">Budget Management</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.revenue || 0)}</div>
                {(() => {
                  const change = formatChange(summary?.revenue || 0, previousPeriod.revenue);
                  return (
                    <p className={`text-xs flex items-center ${change.color}`}>
                      <change.icon className="h-3 w-3 mr-1" />
                      {change.value}% from last period
                    </p>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.expenses || 0)}</div>
                {(() => {
                  const change = formatChange(summary?.expenses || 0, previousPeriod.expenses);
                  return (
                    <p className={`text-xs flex items-center ${change.color}`}>
                      <change.icon className="h-3 w-3 mr-1" />
                      {change.value}% from last period
                    </p>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.netIncome || 0)}</div>
                {(() => {
                  const change = formatChange(summary?.netIncome || 0, previousPeriod.netIncome);
                  return (
                    <p className={`text-xs flex items-center ${change.color}`}>
                      <change.icon className="h-3 w-3 mr-1" />
                      {change.value}% from last period
                    </p>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary?.assets || 0)}</div>
                {(() => {
                  const change = formatChange(summary?.assets || 0, previousPeriod.assets);
                  return (
                    <p className={`text-xs flex items-center ${change.color}`}>
                      <change.icon className="h-3 w-3 mr-1" />
                      {change.value}% from last period
                    </p>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>Latest financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.slice(0, 10).map((entry: AccountEntryType) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{entry.description}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(entry.status || 'pending')}>
                            {entry.status || 'pending'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.entry_date} • {entry.reference_number}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(entry.amount || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.account_categories?.name || 'No Category'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>All accounting transactions and entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.map((entry: AccountEntryType) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{entry.description}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(entry.status || 'pending')}>
                            {entry.status || 'pending'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.entry_date} • Ref: {entry.reference_number}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {formatCurrency(entry.amount || 0)}
                      </p>
                      <div className="flex gap-2 text-xs">
                        {entry.debit_amount && entry.debit_amount > 0 && (
                          <span className="text-green-600">Dr: {formatCurrency(entry.debit_amount)}</span>
                        )}
                        {entry.credit_amount && entry.credit_amount > 0 && (
                          <span className="text-red-600">Cr: {formatCurrency(entry.credit_amount)}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.account_categories?.name || 'No Category'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Budget vs actual performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgets.map((budget: any) => (
                  <div key={budget.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{budget.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {budget.period_type} • {budget.fiscal_year}
                        </p>
                      </div>
                      <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>
                        {budget.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budgeted</p>
                        <p className="font-medium">{formatCurrency(budget.budgeted_amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Actual</p>
                        <p className="font-medium">{formatCurrency(budget.actual_amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Variance</p>
                        <p className={`font-medium ${(budget.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(budget.variance || 0)} ({budget.variance_percentage?.toFixed(1) || 0}%)
                        </p>
                      </div>
                    </div>
                    
                    {budget.variance_percentage && Math.abs(budget.variance_percentage) > 10 && (
                      <div className="mt-3 flex items-center text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Significant variance detected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Assets, Liabilities & Equity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Assets</span>
                    <span className="font-medium">{formatCurrency(summary?.assets || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Liabilities</span>
                    <span className="font-medium">{formatCurrency(summary?.liabilities || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Equity</span>
                    <span className="font-medium">{formatCurrency(summary?.equity || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>Revenue & Expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(summary?.revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses</span>
                    <span className="font-medium text-red-600">{formatCurrency(summary?.expenses || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Income</span>
                    <span className={`font-medium ${(summary?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary?.netIncome || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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