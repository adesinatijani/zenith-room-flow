import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";
import * as XLSX from 'xlsx';

interface InventoryTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData?: (items: any[]) => void;
}

const InventoryTemplateModal = ({ isOpen, onClose, onImportData }: InventoryTemplateModalProps) => {
  const { toast } = useToast();
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  const downloadTemplate = () => {
    const templateData = [
      {
        item_name: "Premium Coffee Beans",
        category: "food",
        current_quantity: 25,
        min_threshold: 10,
        max_threshold: 100,
        unit: "kg",
        cost_per_unit: 45.00,
        supplier: "Global Coffee Co."
      },
      {
        item_name: "Fresh Towels",
        category: "housekeeping", 
        current_quantity: 150,
        min_threshold: 50,
        max_threshold: 300,
        unit: "pieces",
        cost_per_unit: 12.50,
        supplier: "Linen Supply Ltd."
      },
      {
        item_name: "Toilet Paper",
        category: "housekeeping",
        current_quantity: 80,
        min_threshold: 20,
        max_threshold: 200,
        unit: "rolls",
        cost_per_unit: 2.50,
        supplier: "Hygiene Solutions"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    
    // Set column widths
    ws['!cols'] = [
      { width: 25 }, // item_name
      { width: 15 }, // category  
      { width: 15 }, // current_quantity
      { width: 15 }, // min_threshold
      { width: 15 }, // max_threshold
      { width: 10 }, // unit
      { width: 15 }, // cost_per_unit
      { width: 20 }  // supplier
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Inventory Template");
    
    const fileName = "inventory_template.xlsx";
    
    // Create a download link that allows user to choose save location
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link with folder selection
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Inventory template has been saved. Choose your preferred folder to save it.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      toast({
        title: "Invalid File Format",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map category values to valid database categories
        const mapCategory = (cat: string): string => {
          const categoryLower = cat?.toLowerCase() || '';
          
          // Beverages mapping
          if (categoryLower.includes('drink') || categoryLower.includes('beer') || 
              categoryLower.includes('wine') || categoryLower.includes('spirit') || 
              categoryLower.includes('beverage') || categoryLower.includes('juice') ||
              categoryLower.includes('water') || categoryLower.includes('soda')) {
            return 'beverages';
          }
          
          // Food mapping
          if (categoryLower.includes('food') || categoryLower.includes('snack') || 
              categoryLower.includes('meal') || categoryLower.includes('ingredient')) {
            return 'food';
          }
          
          // Housekeeping mapping
          if (categoryLower.includes('housekeeping') || categoryLower.includes('cleaning') || 
              categoryLower.includes('towel') || categoryLower.includes('linen')) {
            return 'housekeeping';
          }
          
          // Maintenance mapping
          if (categoryLower.includes('maintenance') || categoryLower.includes('repair') || 
              categoryLower.includes('tool')) {
            return 'maintenance';
          }
          
          // Default to beverages for drinks, otherwise office
          return categoryLower.includes('drink') ? 'beverages' : 'office';
        };

        const processedData = jsonData.map((row: any) => {
          const rawCategory = row.category || row['Category'] || 'office';
          const mappedCategory = mapCategory(rawCategory);
          
          return {
            item_name: row.item_name || row['Item Name'] || '',
            category: mappedCategory,
            current_quantity: Number(row.current_quantity || row['Current Quantity'] || 0),
            min_threshold: Number(row.min_threshold || row['Min Threshold'] || 10),
            max_threshold: Number(row.max_threshold || row['Max Threshold'] || 100),
            unit: row.unit || row['Unit'] || 'pieces',
            cost_per_unit: Number(row.cost_per_unit || row['Cost Per Unit'] || 0),
            supplier: row.supplier || row['Supplier'] || ''
          };
        });

        console.log('Processed import data:', processedData);

        setUploadedData(processedData);
        
        toast({
          title: "File Uploaded Successfully",
          description: `Found ${processedData.length} inventory items in the file.`,
        });
      } catch (error) {
        toast({
          title: "Error Processing File",
          description: "There was an error reading the Excel file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (uploadedData.length > 0 && onImportData) {
      onImportData(uploadedData);
      setUploadedData([]);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Inventory Template</DialogTitle>
          <DialogDescription>
            Download a template or upload inventory items from an Excel file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Download Template</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Download a pre-formatted Excel template with sample inventory data and correct column headers.
            </p>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Inventory Template
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Upload Inventory Items</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload an Excel file with inventory items. Make sure your file has the correct column headers.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Excel File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>

              {uploadedData.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Preview ({uploadedData.length} items)</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {uploadedData.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-sm bg-background p-2 rounded border">
                        <span className="font-medium">{item.item_name}</span> - 
                        <span className="text-muted-foreground ml-1">
                          {item.category} | {item.current_quantity} {item.unit} | ${item.cost_per_unit}
                        </span>
                      </div>
                    ))}
                    {uploadedData.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        ...and {uploadedData.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          {uploadedData.length > 0 && (
            <Button onClick={handleImport} className="w-full sm:w-auto">
              Import {uploadedData.length} Items
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryTemplateModal;