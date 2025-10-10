import { useState } from "react";
import { 
  Menu, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  DollarSign,
  Star,
  TrendingUp,
  Settings,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMenuItemsDB, MenuItem } from "@/hooks/useMenuItemsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import EditMenuItemModal from "@/components/menu/EditMenuItemModal";
import DeleteMenuItemModal from "@/components/menu/DeleteMenuItemModal";
import AddMenuItemModal from "@/components/menu/AddMenuItemModal";
import MenuSettingsModal from "@/components/menu/MenuSettingsModal";
import MenuTemplateModal from "@/components/menu/MenuTemplateModal";
import MenuExportModal from "@/components/menu/MenuExportModal";
import { LinkRecipeModal } from "@/components/menu/LinkRecipeModal";

const MenuManagement = () => {
  const { menuItems, loading, addMenuItem, updateMenuItem, deleteMenuItem } = useMenuItemsDB();
  const { formatCurrency } = useGlobalSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isLinkRecipeOpen, setIsLinkRecipeOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleImportData = async (importedItems: Partial<MenuItem>[]) => {
    for (const item of importedItems) {
      await addMenuItem({
        name: item.name || "",
        price: item.price || 0,
        description: item.description || "",
        category: item.category || "Main Course",
        preparation_time: item.preparation_time || 15,
        calories: item.calories,
        is_popular: Boolean(item.is_popular),
        is_available: item.is_available !== false,
        allergens: item.allergens || [],
        ingredients: item.ingredients || []
      });
    }
  };

  const categories = [
    "Appetizers", "Main Course", "Desserts", "Salads", "Soups", "Sides",
    "Red Wine", "White Wine", "Rosé Wine", "Sparkling Wine", "Cocktails", 
    "Spirits", "Beer", "Non-Alcoholic Beverages", "Hot Beverages", "Beverages"
  ];

  const allergens = [
    "Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish"
  ];

  // Separate kitchen items from drinks (match database categories)
  const drinkCategories = ['soft drinks', 'alcoholic beverages', 'spirits', 'hot beverages', 'beer', 'wine', 'liquor', 'juice', 'water', 'energy drinks', 'cocktails', 'drinks', 'beverages'];
  
  const kitchenItems = menuItems.filter(item => !drinkCategories.includes(item.category.toLowerCase()));
  const drinkItems = menuItems.filter(item => drinkCategories.includes(item.category.toLowerCase()));

  const filterItems = (items: typeof menuItems) => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredKitchenItems = filterItems(kitchenItems);
  const filteredDrinkItems = filterItems(drinkItems);

  const MenuItemCard = ({ item, isDrink = false }: { item: MenuItem; isDrink?: boolean }) => {
    const profitMargin = item.cost_price && item.price 
      ? ((item.price - item.cost_price) / item.price * 100).toFixed(1)
      : null;

    return (
    <Card className={`card-luxury ${!item.is_available ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              {item.is_popular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
              {!item.is_available && <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </div>
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedItem(item);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setSelectedItem(item);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              {isDrink && item.tracks_inventory && (
                <>
                  <div className="text-sm text-muted-foreground">Cost: {formatCurrency(item.cost_price || 0)}</div>
                  <div className="text-2xl font-bold text-accent">
                    {formatCurrency(item.price)}
                  </div>
                  {profitMargin && (
                    <div className="text-xs text-green-600 font-semibold">
                      {profitMargin}% profit
                    </div>
                  )}
                </>
              )}
              {!isDrink && (
                <div className="text-2xl font-bold text-accent">
                  {formatCurrency(item.price)}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{item.category}</Badge>
              <Badge variant={item.is_available ? "default" : "secondary"}>
                {item.is_available ? "Available" : "Unavailable"}
              </Badge>
              {!isDrink && item.recipe_id && (
                <Badge variant="outline" className="bg-green-50">
                  ✓ Recipe Linked
                </Badge>
              )}
            </div>
          </div>

          {!isDrink && (
            <Button 
              onClick={() => {
                setSelectedItem(item);
                setIsLinkRecipeOpen(true);
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {item.recipe_id ? "Edit Recipe Link" : "Link to Recipe"}
            </Button>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Prep Time:</span> {item.preparation_time}min
            </div>
            {item.calories && (
              <div>
                <span className="font-medium">Calories:</span> {item.calories}
              </div>
            )}
          </div>

          {item.allergens.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Allergens</h4>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen) => (
                  <Badge key={allergen} variant="outline" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Main Ingredients</h4>
            <div className="flex flex-wrap gap-1">
              {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
              {item.ingredients.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.ingredients.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Menu className="h-8 w-8 text-accent" />
            Menu Management
          </h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsSettingsDialogOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            className="button-luxury"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Menu className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{kitchenItems.length}</p>
                <p className="text-sm text-muted-foreground">Kitchen Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{drinkItems.length}</p>
                <p className="text-sm text-muted-foreground">Drinks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{menuItems.filter(i => i.is_available).length}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-luxury">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{menuItems.filter(i => i.is_popular).length}</p>
                  <p className="text-sm text-muted-foreground">Popular Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-luxury">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(menuItems.length > 0 ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length : 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Price</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Items Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">🍳 Kitchen Items</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredKitchenItems.map((item) => (
            <MenuItemCard key={item.id} item={item} isDrink={false} />
          ))}
        </div>
        {filteredKitchenItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No kitchen items found</p>
          </div>
        )}
      </div>

      {/* Drinks Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">🍹 Drinks</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrinkItems.map((item) => (
            <MenuItemCard key={item.id} item={item} isDrink={true} />
          ))}
        </div>
        {filteredDrinkItems.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-lg p-8">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No drinks found</h3>
            <p className="text-muted-foreground">Add drinks in Inventory Management to automatically create menu items here</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMenuItemModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addMenuItem}
        categories={categories}
        allergens={allergens}
      />
      
      <EditMenuItemModal 
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onUpdate={updateMenuItem}
        categories={categories}
        allergens={allergens}
      />
      
      <DeleteMenuItemModal 
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onDelete={deleteMenuItem}
      />
      
      <MenuSettingsModal 
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />
      
      <MenuTemplateModal 
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onImportData={handleImportData}
      />
      
      <MenuExportModal 
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        menuItems={menuItems}
      />

      {selectedItem && (
        <LinkRecipeModal
          isOpen={isLinkRecipeOpen}
          onClose={() => {
            setIsLinkRecipeOpen(false);
            setSelectedItem(null);
          }}
          menuItemId={selectedItem.id}
          menuItemName={selectedItem.name}
          currentRecipeId={selectedItem.recipe_id}
        />
      )}
    </div>
  );
};

export default MenuManagement;