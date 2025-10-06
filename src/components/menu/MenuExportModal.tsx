import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Calendar, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';
import { MenuItem } from "@/hooks/useMenuItemsDB";

interface MenuExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

const MenuExportModal = ({ isOpen, onClose, menuItems }: MenuExportModalProps) => {
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [includeFields, setIncludeFields] = useState({
    name: true,
    price: true,
    description: true,
    category: true,
    preparation_time: true,
    calories: true,
    is_popular: true,
    is_available: true,
    allergens: true,
    ingredients: true
  });

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleFieldChange = (field: keyof typeof includeFields, checked: boolean) => {
    setIncludeFields(prev => ({ ...prev, [field]: checked }));
  };

  const exportData = () => {
    let filteredItems = menuItems;
    
    // Filter by categories if any selected
    if (selectedCategories.length > 0) {
      filteredItems = menuItems.filter(item => selectedCategories.includes(item.category));
    }

    // Prepare data based on selected fields
    const exportData = filteredItems.map(item => {
      const exportItem: any = {};
      
      if (includeFields.name) exportItem.name = item.name;
      if (includeFields.price) exportItem.price = item.price;
      if (includeFields.description) exportItem.description = item.description;
      if (includeFields.category) exportItem.category = item.category;
      if (includeFields.preparation_time) exportItem.preparation_time = item.preparation_time;
      if (includeFields.calories) exportItem.calories = item.calories || '';
      if (includeFields.is_popular) exportItem.is_popular = item.is_popular ? 'Yes' : 'No';
      if (includeFields.is_available) exportItem.is_available = item.is_available ? 'Yes' : 'No';
      if (includeFields.allergens) exportItem.allergens = item.allergens.join(', ');
      if (includeFields.ingredients) exportItem.ingredients = item.ingredients.join(', ');
      
      return exportItem;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu Export");

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // name
      { wch: 10 }, // price
      { wch: 40 }, // description
      { wch: 15 }, // category
      { wch: 15 }, // preparationTime
      { wch: 10 }, // calories
      { wch: 12 }, // isPopular
      { wch: 12 }, // isAvailable
      { wch: 20 }, // allergens
      { wch: 30 }  // ingredients
    ];

    const fileName = `menu_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    
    if (exportFormat === 'xlsx') {
      XLSX.writeFile(wb, fileName);
    } else {
      XLSX.writeFile(wb, fileName, { bookType: 'csv' });
    }

    toast({
      title: "Export completed",
      description: `${filteredItems.length} menu items exported successfully.`
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-accent" />
            Export Menu Data
          </DialogTitle>
          <DialogDescription>
            Export your menu items to an Excel or CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Format</CardTitle>
              <CardDescription>Choose the file format for your export</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={exportFormat} onValueChange={(value: 'xlsx' | 'csv') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filter by Category
              </CardTitle>
              <CardDescription>
                Select categories to export (leave empty to export all)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Include Fields</CardTitle>
              <CardDescription>Choose which fields to include in the export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(includeFields).map(([field, checked]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field}`}
                      checked={checked}
                      onCheckedChange={(checked) => handleFieldChange(field as keyof typeof includeFields, checked as boolean)}
                    />
                    <Label htmlFor={`field-${field}`} className="text-sm capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Total items:</strong> {
                    selectedCategories.length > 0 
                      ? menuItems.filter(item => selectedCategories.includes(item.category)).length
                      : menuItems.length
                  }
                </p>
                <p>
                  <strong>Categories:</strong> {
                    selectedCategories.length > 0 
                      ? selectedCategories.join(', ')
                      : 'All categories'
                  }
                </p>
                <p>
                  <strong>Fields:</strong> {Object.entries(includeFields).filter(([, checked]) => checked).length} selected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={exportData} className="button-luxury">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuExportModal;