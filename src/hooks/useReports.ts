import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface ReportData {
  financial: {
    dailyRevenue: any[];
    monthlyPL: any[];
    cashFlow: any[];
    taxSummary: any[];
  };
  occupancy: {
    occupancyRate: any[];
    adrRevpar: any[];
    bookingForecast: any[];
    cancellationAnalysis: any[];
  };
  guest: {
    demographics: any[];
    satisfaction: any[];
    loyalty: any[];
    history: any[];
  };
  operational: {
    staffPerformance: any[];
    housekeeping: any[];
    inventory: any[];
    maintenance: any[];
  };
}

export const useReports = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const getDateRange = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'today':
        return { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: format(yesterday, 'yyyy-MM-dd'), end: format(yesterday, 'yyyy-MM-dd') };
      case 'last-7-days':
        return { start: format(subDays(now, 7), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
      case 'last-30-days':
        return { start: format(subDays(now, 30), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
      case 'this-month':
        return { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') };
      case 'last-month':
        const lastMonth = subDays(startOfMonth(now), 1);
        return { start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'), end: format(endOfMonth(lastMonth), 'yyyy-MM-dd') };
      case 'this-year':
        return { start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(endOfYear(now), 'yyyy-MM-dd') };
      default:
        return { start: format(subDays(now, 30), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
    }
  };

  // Financial Reports Data
  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-reports'],
    queryFn: async () => {
      try {
        // Get account entries for financial data
        const { data: accountEntries, error: entriesError } = await supabase
          .from('account_entries')
          .select('*')
          .order('entry_date', { ascending: false })
          .limit(100);

        if (entriesError) throw entriesError;

        // Get orders for revenue data
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (ordersError) throw ordersError;

        return {
          accountEntries: accountEntries || [],
          orders: orders || []
        };
      } catch (error) {
        console.error('Error fetching financial data:', error);
        return { accountEntries: [], orders: [] };
      }
    }
  });

  // Guest Reports Data
  const { data: guestData, isLoading: guestLoading } = useQuery({
    queryKey: ['guest-reports'],
    queryFn: async () => {
      try {
        // Since we don't have guests table, we'll use orders as proxy for guest data
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return orders || [];
      } catch (error) {
        console.error('Error fetching guest data:', error);
        return [];
      }
    }
  });

  // Operational Reports Data
  const { data: operationalData, isLoading: operationalLoading } = useQuery({
    queryKey: ['operational-reports'],
    queryFn: async () => {
      try {
        // Get employees data using secure access function
        const { data: employees, error: employeesError } = await supabase.rpc('get_employee_data_secure');

        if (employeesError) throw employeesError;

        // Get additional department and position data for employees that have access
        const employeesWithRelations = await Promise.all(
          (employees || []).map(async (employee) => {
            const [deptResult, posResult] = await Promise.all([
              employee.department_id ? 
                supabase.from('departments').select('*').eq('id', employee.department_id).single() :
                Promise.resolve({ data: null }),
              employee.position_id ?
                supabase.from('employee_positions').select('*').eq('id', employee.position_id).single() :
                Promise.resolve({ data: null })
            ]);

            return {
              ...employee,
              departments: deptResult.data,
              employee_positions: posResult.data
            };
          })
        );

        // Get inventory data
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .order('updated_at', { ascending: false });

        if (inventoryError) throw inventoryError;

        return {
          employees: employees || [],
          inventory: inventory || []
        };
      } catch (error) {
        console.error('Error fetching operational data:', error);
        return { employees: [], inventory: [] };
      }
    }
  });

  const generateReport = async (reportName: string, period: string, format: string) => {
    setIsGenerating(true);
    try {
      const dateRange = getDateRange(period);
      
      // Simulate report generation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create report data based on type
      let reportData: any = {};
      
      if (reportName.includes('Revenue')) {
        reportData = {
          title: reportName,
          period: `${dateRange.start} to ${dateRange.end}`,
          data: financialData?.orders || [],
          totalRevenue: financialData?.orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        };
      } else if (reportName.includes('Staff')) {
        reportData = {
          title: reportName,
          period: `${dateRange.start} to ${dateRange.end}`,
          data: operationalData?.employees || [],
          totalEmployees: operationalData?.employees?.length || 0
        };
      } else {
        reportData = {
          title: reportName,
          period: `${dateRange.start} to ${dateRange.end}`,
          generatedAt: new Date().toISOString()
        };
      }

      // Save report to financial_reports table
      const { error } = await supabase
        .from('financial_reports')
        .insert({
          report_type: reportName.toLowerCase().replace(/\s+/g, '_'),
          period_start: dateRange.start,
          period_end: dateRange.end,
          report_data: reportData,
          generated_by: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Report Generated",
        description: `${reportName} has been generated successfully for ${period}`,
      });

      return reportData;
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (reportName: string, format: string = 'pdf') => {
    try {
      // Get the latest report of this type
      const { data: report, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('report_type', reportName.toLowerCase().replace(/\s+/g, '_'))
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !report) {
        toast({
          title: "Error",
          description: "No report found. Please generate the report first.",
          variant: "destructive",
        });
        return;
      }

      // Create downloadable content
      let content = '';
      let mimeType = '';
      let filename = '';

      switch (format.toLowerCase()) {
        case 'pdf':
          // For PDF, we'd need a library like jsPDF, but for now we'll use JSON
          content = JSON.stringify(report.report_data, null, 2);
          mimeType = 'application/json';
          filename = `${reportName.replace(/\s+/g, '_')}_${format}.json`;
          break;
        case 'excel':
        case 'csv':
          // Convert to CSV format
          const reportData = report.report_data as any;
          const data = Array.isArray(reportData?.data) ? reportData.data : [reportData];
          if (data.length === 0 || !data[0]) {
            content = 'No data available';
          } else {
            const headers = Object.keys(data[0]);
            const csvContent = [
              headers.join(','),
              ...data.map((row: any) => headers.map(header => row[header] || '').join(','))
            ].join('\n');
            content = csvContent;
          }
          mimeType = 'text/csv';
          filename = `${reportName.replace(/\s+/g, '_')}.csv`;
          break;
        case 'json':
        default:
          content = JSON.stringify(report.report_data, null, 2);
          mimeType = 'application/json';
          filename = `${reportName.replace(/\s+/g, '_')}.json`;
          break;
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${reportName} is being downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get saved reports
  const { data: savedReports, isLoading: savedReportsLoading, refetch: refetchSavedReports } = useQuery({
    queryKey: ['saved-reports'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('financial_reports')
          .select('*')
          .order('generated_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching saved reports:', error);
        return [];
      }
    }
  });

  return {
    // Data
    financialData,
    guestData,
    operationalData,
    savedReports,
    
    // Loading states
    financialLoading,
    guestLoading,
    operationalLoading,
    savedReportsLoading,
    isGenerating,
    
    // Actions
    generateReport,
    downloadReport,
    refetchSavedReports,
    getDateRange
  };
};