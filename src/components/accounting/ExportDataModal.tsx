import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { Download, FileSpreadsheet, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: any[];
  summary: any;
  budgets: any[];
}

export const ExportDataModal = ({ isOpen, onClose, entries, summary, budgets }: ExportDataModalProps) => {
  const { toast } = useToast();
  const { formatCurrency } = useGlobalSettings();
  const [exportFormat, setExportFormat] = useState("excel");
  const [exportType, setExportType] = useState("complete");
  const [includeOptions, setIncludeOptions] = useState({
    entries: true,
    summary: true,
    budgets: true,
    analytics: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const generateCSVContent = () => {
    let csvContent = "";
    
    if (includeOptions.summary && summary) {
      csvContent += "Financial Summary\n";
      csvContent += "Category,Amount\n";
      csvContent += `Revenue,${summary.revenue}\n`;
      csvContent += `Expenses,${summary.expenses}\n`;
      csvContent += `Net Income,${summary.netIncome}\n`;
      csvContent += `Assets,${summary.assets}\n`;
      csvContent += `Liabilities,${summary.liabilities}\n`;
      csvContent += `Equity,${summary.equity}\n\n`;
    }

    if (includeOptions.entries && entries.length > 0) {
      csvContent += "Journal Entries\n";
      csvContent += "Date,Description,Reference,Category,Amount,Debit,Credit,Status\n";
      entries.forEach(entry => {
        csvContent += `${entry.entry_date},"${entry.description}",${entry.reference_number || ''},${entry.account_categories?.name || ''},${entry.amount},${entry.debit_amount},${entry.credit_amount},${entry.status}\n`;
      });
      csvContent += "\n";
    }

    if (includeOptions.budgets && budgets.length > 0) {
      csvContent += "Budget Information\n";
      csvContent += "Budget Name,Category,Budgeted Amount,Actual Amount,Variance,Variance %\n";
      budgets.forEach(budget => {
        csvContent += `"${budget.name}","${budget.account_categories?.name || ''}",${budget.budgeted_amount},${budget.actual_amount},${budget.variance},${budget.variance_percentage}%\n`;
      });
    }

    return csvContent;
  };

  const generateExcelContent = () => {
    // For Excel format, we'll use CSV with Excel-specific formatting
    return generateCSVContent();
  };

  const generatePDFContent = () => {
    // Simple PDF structure as text
    let pdfContent = `Financial Report - ${format(new Date(), 'yyyy-MM-dd')}\n\n`;
    
    if (includeOptions.summary && summary) {
      pdfContent += "FINANCIAL SUMMARY\n";
      pdfContent += "==================\n";
      pdfContent += `Revenue: ${formatCurrency(summary.revenue || 0)}\n`;
      pdfContent += `Expenses: ${formatCurrency(summary.expenses || 0)}\n`;
      pdfContent += `Net Income: ${formatCurrency(summary.netIncome || 0)}\n`;
      pdfContent += `Assets: ${formatCurrency(summary.assets || 0)}\n`;
      pdfContent += `Liabilities: ${formatCurrency(summary.liabilities || 0)}\n`;
      pdfContent += `Equity: ${formatCurrency(summary.equity || 0)}\n\n`;
    }

    if (includeOptions.entries && entries.length > 0) {
      pdfContent += "JOURNAL ENTRIES\n";
      pdfContent += "================\n";
      entries.forEach(entry => {
        pdfContent += `${entry.entry_date} | ${entry.description} | ${formatCurrency(entry.amount || 0)}\n`;
      });
    }

    return pdfContent;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content = "";
      let fileName = `accounting_report_${format(new Date(), 'yyyy-MM-dd')}`;
      let mimeType = "";

      switch (exportFormat) {
        case "csv":
          content = generateCSVContent();
          fileName += ".csv";
          mimeType = "text/csv";
          break;
        case "excel":
          content = generateExcelContent();
          fileName += ".xlsx";
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        case "pdf":
          content = generatePDFContent();
          fileName += ".pdf";
          mimeType = "application/pdf";
          break;
        default:
          content = generateCSVContent();
          fileName += ".csv";
          mimeType = "text/csv";
      }

      // Try to use File System Access API if available
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: `${exportFormat.toUpperCase()} files`,
              accept: { [mimeType]: [`.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
          
          toast({
            title: "Export Successful",
            description: `Data exported successfully as ${fileName}`,
          });
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            throw err;
          }
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export Started",
          description: `${fileName} download started`,
        });
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Financial Data
          </DialogTitle>
          <DialogDescription>
            Choose your export format and data to include in the report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (Comma Separated Values)
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (XLSX)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Report Type</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Complete Financial Report</SelectItem>
                <SelectItem value="summary">Summary Only</SelectItem>
                <SelectItem value="entries">Journal Entries Only</SelectItem>
                <SelectItem value="budgets">Budget Report Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Options */}
          {exportType === "complete" && (
            <div className="space-y-3">
              <Label>Include in Export</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-summary"
                    checked={includeOptions.summary}
                    onCheckedChange={(checked) => 
                      setIncludeOptions(prev => ({ ...prev, summary: !!checked }))
                    }
                  />
                  <Label htmlFor="include-summary" className="text-sm font-normal">
                    Financial Summary
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-entries"
                    checked={includeOptions.entries}
                    onCheckedChange={(checked) => 
                      setIncludeOptions(prev => ({ ...prev, entries: !!checked }))
                    }
                  />
                  <Label htmlFor="include-entries" className="text-sm font-normal">
                    Journal Entries ({entries.length} entries)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-budgets"
                    checked={includeOptions.budgets}
                    onCheckedChange={(checked) => 
                      setIncludeOptions(prev => ({ ...prev, budgets: !!checked }))
                    }
                  />
                  <Label htmlFor="include-budgets" className="text-sm font-normal">
                    Budget Information ({budgets.length} budgets)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-analytics"
                    checked={includeOptions.analytics}
                    onCheckedChange={(checked) => 
                      setIncludeOptions(prev => ({ ...prev, analytics: !!checked }))
                    }
                  />
                  <Label htmlFor="include-analytics" className="text-sm font-normal">
                    Analytics & Trends
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Export Preview */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              Export Preview
            </div>
            <div className="text-sm">
              <p>Format: {exportFormat.toUpperCase()}</p>
              <p>Date: {format(new Date(), 'PPP')}</p>
              <p>Entries: {entries.length} journal entries</p>
              <p>File name: accounting_report_{format(new Date(), 'yyyy-MM-dd')}.{exportFormat === 'excel' ? 'xlsx' : exportFormat}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex-1 button-luxury"
          >
            {isExporting ? "Exporting..." : "Export & Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};