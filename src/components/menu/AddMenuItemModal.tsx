import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => Promise<any>;
  categories: string[];
  allergens: string[];
}

const AddMenuItemModal = ({ isOpen, onClose, onAdd, categories, allergens }: AddMenuItemModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    category: categories[0] || "Main Course",
    preparation_time: 15,
    calories: undefined as number | undefined,
    is_popular: false,
    is_available: true,
    allergens: [] as string[],
    ingredients: [] as string[]
  });

  const handleSave = async () => {
    try {
      await onAdd(formData);
      setFormData({
        name: "",
        price: 0,
        description: "",
        category: categories[0] || "Main Course",
        preparation_time: 15,
        calories: undefined,
        is_popular: false,
        is_available: true,
        allergens: [],
        ingredients: []
      });
      onClose();
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogDescription>Create a new item for your restaurant menu</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="allergens">Allergens</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input 
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe the menu item..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prep Time (min)</Label>
                <Input 
                  type="number" 
                  placeholder="15"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData({...formData, preparation_time: parseInt(e.target.value) || 15})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Calories (optional)</Label>
                <Input 
                  type="number" 
                  placeholder="350"
                  value={formData.calories || ""}
                  onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value) || undefined})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Main Ingredients (comma separated)</Label>
              <Textarea 
                placeholder="chicken, garlic, butter, herbs..."
                value={formData.ingredients.join(", ")}
                onChange={(e) => setFormData({...formData, ingredients: e.target.value.split(",").map(i => i.trim())})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({...formData, is_popular: checked})}
              />
              <Label htmlFor="popular">Mark as Popular Item</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
              />
              <Label htmlFor="available">Available for Order</Label>
            </div>
          </TabsContent>

          <TabsContent value="allergens" className="space-y-4">
            <div className="space-y-2">
              <Label>Select Allergens</Label>
              <div className="grid grid-cols-2 gap-2">
                {allergens.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Switch 
                      id={allergen.toLowerCase()}
                      checked={formData.allergens.includes(allergen)}
                      onCheckedChange={() => toggleAllergen(allergen)}
                    />
                    <Label htmlFor={allergen.toLowerCase()}>{allergen}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="button-luxury"
            onClick={handleSave}
            disabled={!formData.name || formData.price <= 0}
          >
            Save Menu Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMenuItemModal;
