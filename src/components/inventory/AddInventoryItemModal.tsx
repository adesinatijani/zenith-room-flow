import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

interface InventoryFormData {
  item_name: string;
  category: string;
  current_quantity: number;
  min_threshold: number;
  max_threshold: number;
  unit: string;
  cost_per_unit: number;
  supplier: string;
}

const AddInventoryItemModal = ({ isOpen, onClose, onItemAdded }: AddInventoryItemModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<InventoryFormData>();

  const categories = [
    { value: 'food', label: 'Food Items' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'amenities', label: 'Guest Amenities' }
  ];

  const units = [
    'pieces', 'kg', 'liters', 'bottles', 'boxes', 'rolls', 'packets', 'units'
  ];

  const onSubmit = async (data: InventoryFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Inventory item added",
        description: `${data.item_name} has been added to inventory.`,
      });
      
      reset();
      onItemAdded?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory management system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name</Label>
              <Input 
                id="item_name"
                {...register("item_name", { required: "Item name is required" })}
                placeholder="Enter item name"
              />
              {errors.item_name && <span className="text-sm text-destructive">{errors.item_name.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_quantity">Current Stock</Label>
              <Input 
                id="current_quantity"
                type="number"
                min="0"
                {...register("current_quantity", { required: "Current quantity is required", min: 0, valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_threshold">Minimum Stock</Label>
              <Input 
                id="min_threshold"
                type="number"
                min="0"
                {...register("min_threshold", { required: "Minimum threshold is required", min: 0, valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_threshold">Maximum Stock</Label>
              <Input 
                id="max_threshold"
                type="number"
                min="0"
                {...register("max_threshold", { required: "Maximum threshold is required", min: 0, valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measurement</Label>
              <Select onValueChange={(value) => setValue("unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
              <Input 
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                {...register("cost_per_unit", { required: "Cost per unit is required", min: 0, valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input 
              id="supplier"
              {...register("supplier")}
              placeholder="Enter supplier name"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryItemModal;