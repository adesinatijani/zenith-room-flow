import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { Settings, Plus, Trash2, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface MenuSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuSettingsModal = ({ isOpen, onClose }: MenuSettingsModalProps) => {
  const { toast } = useToast();
  const { settings: globalSettings } = useGlobalSettings();
  const [newCategory, setNewCategory] = useState("");
  const [newAllergen, setNewAllergen] = useState("");
  
  const [categories] = useState([
    "Appetizers", "Main Course", "Desserts", "Salads", "Soups", "Sides",
    "Red Wine", "White Wine", "Rosé Wine", "Sparkling Wine", "Cocktails", 
    "Spirits", "Beer", "Non-Alcoholic Beverages", "Hot Beverages"
  ]);

  const [allergens] = useState([
    "Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"
  ]);

  const [settings, setSettings] = useState({
    autoMarkUnavailable: true,
    showCalories: true,
    showPreparationTime: true,
    allowCustomizations: true,
    requireAllergensInfo: false,
    defaultTaxRate: globalSettings.tax_rate || 7.5,
    currency: globalSettings.currency || "USD",
    menuDescription: "Fresh, locally sourced ingredients prepared with passion"
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Menu settings have been updated successfully."
    });
    onClose();
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      toast({
        title: "Category added",
        description: `"${newCategory}" has been added to menu categories.`
      });
      setNewCategory("");
    }
  };

  const addAllergen = () => {
    if (newAllergen.trim()) {
      toast({
        title: "Allergen added",
        description: `"${newAllergen}" has been added to allergen list.`
      });
      setNewAllergen("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
            Menu Settings
          </DialogTitle>
          <DialogDescription>Configure your menu categories, allergens, and display preferences</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="allergens">Allergens</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Menu Display Settings</CardTitle>
                <CardDescription>Configure how your menu appears to customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Menu Description</Label>
                  <Textarea 
                    value={settings.menuDescription}
                    onChange={(e) => setSettings({...settings, menuDescription: e.target.value})}
                    placeholder="Describe your restaurant's approach to food..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-calories"
                      checked={settings.showCalories}
                      onCheckedChange={(checked) => setSettings({...settings, showCalories: checked})}
                    />
                    <Label htmlFor="show-calories">Show Calories on Menu</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-prep-time"
                      checked={settings.showPreparationTime}
                      onCheckedChange={(checked) => setSettings({...settings, showPreparationTime: checked})}
                    />
                    <Label htmlFor="show-prep-time">Show Preparation Time</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allow-customizations"
                      checked={settings.allowCustomizations}
                      onCheckedChange={(checked) => setSettings({...settings, allowCustomizations: checked})}
                    />
                    <Label htmlFor="allow-customizations">Allow Order Customizations</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="require-allergens"
                      checked={settings.requireAllergensInfo}
                      onCheckedChange={(checked) => setSettings({...settings, requireAllergensInfo: checked})}
                    />
                    <Label htmlFor="require-allergens">Require Allergen Information</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>Configure automatic menu management features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-unavailable"
                    checked={settings.autoMarkUnavailable}
                    onCheckedChange={(checked) => setSettings({...settings, autoMarkUnavailable: checked})}
                  />
                  <Label htmlFor="auto-unavailable">Auto-mark items as unavailable when out of stock</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Categories</CardTitle>
                <CardDescription>Manage the categories for organizing your menu items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add new category..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={addCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center justify-between p-2 border rounded">
                      <Badge variant="secondary">{category}</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allergens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Allergen Management</CardTitle>
                <CardDescription>Manage allergen types for menu items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add new allergen..."
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                  />
                  <Button onClick={addAllergen}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {allergens.map((allergen) => (
                    <div key={allergen} className="flex items-center justify-between p-2 border rounded">
                      <Badge variant="outline">{allergen}</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Configuration</CardTitle>
                <CardDescription>Tax rate and currency are managed from global settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Tax Rate (%)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={globalSettings.tax_rate || 7.5}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Configured in global settings</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input 
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="button-luxury" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuSettingsModal;