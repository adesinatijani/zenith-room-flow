import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, ChefHat, Package } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  category: string;
  cost: number;
}

interface InventoryItem {
  id: string;
  item_name: string;
  unit: string;
  current_quantity: number;
  cost_per_unit: number;
}

interface RecipeIngredient {
  inventory_item_id: string;
  quantity_needed: number;
  unit: string;
  item_name?: string;
  cost?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: string;
  menuItemName: string;
  currentRecipeId?: string;
}

export const LinkRecipeModal = ({ isOpen, onClose, menuItemId, menuItemName, currentRecipeId }: Props) => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(currentRecipeId || "");
  const [creatingNew, setCreatingNew] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
      fetchInventory();
      if (currentRecipeId) {
        fetchRecipeIngredients(currentRecipeId);
      }
    }
  }, [isOpen, currentRecipeId]);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, name, category, cost')
      .order('name');
    
    if (!error && data) {
      setRecipes(data);
    }
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, item_name, unit, current_quantity, cost_per_unit')
      .order('item_name');
    
    if (!error && data) {
      setInventory(data);
    }
  };

  const fetchRecipeIngredients = async (recipeId: string) => {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select(`
        inventory_item_id,
        quantity_needed,
        unit,
        inventory:inventory_item_id (
          item_name,
          cost_per_unit
        )
      `)
      .eq('recipe_id', recipeId);
    
    if (!error && data) {
      const formatted = data.map((ing: any) => ({
        inventory_item_id: ing.inventory_item_id,
        quantity_needed: ing.quantity_needed,
        unit: ing.unit,
        item_name: ing.inventory?.item_name,
        cost: ing.inventory?.cost_per_unit
      }));
      setIngredients(formatted);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {
      inventory_item_id: "",
      quantity_needed: 0,
      unit: ""
    }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill unit when inventory item is selected
    if (field === 'inventory_item_id' && value) {
      const item = inventory.find(inv => inv.id === value);
      if (item) {
        updated[index].unit = item.unit;
        updated[index].item_name = item.item_name;
        updated[index].cost = item.cost_per_unit;
      }
    }
    
    setIngredients(updated);
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((sum, ing) => {
      const invItem = inventory.find(i => i.id === ing.inventory_item_id);
      return sum + (invItem ? invItem.cost_per_unit * ing.quantity_needed : 0);
    }, 0);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let recipeIdToUse = selectedRecipeId;

      // Create new recipe if needed
      if (creatingNew) {
        if (!newRecipeName.trim()) {
          toast({
            title: "Error",
            description: "Please enter a recipe name",
            variant: "destructive"
          });
          return;
        }

        const totalCost = calculateTotalCost();

        const { data: newRecipe, error: recipeError } = await supabase
          .from('recipes')
          .insert({
            name: newRecipeName,
            category: 'Main Course',
            prep_time: 10,
            cook_time: 20,
            servings: 1,
            cost: totalCost,
            difficulty: 'Medium',
            ingredients: [],
            instructions: []
          })
          .select()
          .single();

        if (recipeError) throw recipeError;
        recipeIdToUse = newRecipe.id;

        // Add ingredients to recipe
        if (ingredients.length > 0) {
          const ingredientsToInsert = ingredients
            .filter(ing => ing.inventory_item_id && ing.quantity_needed > 0)
            .map(ing => ({
              recipe_id: recipeIdToUse,
              inventory_item_id: ing.inventory_item_id,
              quantity_needed: ing.quantity_needed,
              unit: ing.unit
            }));

          const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(ingredientsToInsert);

          if (ingredientsError) throw ingredientsError;
        }
      }

      // Link recipe to menu item
      const { error: linkError } = await supabase
        .from('menu_items')
        .update({ 
          recipe_id: recipeIdToUse,
          cost_price: calculateTotalCost()
        })
        .eq('id', menuItemId);

      if (linkError) throw linkError;

      toast({
        title: "Success",
        description: `Recipe ${creatingNew ? 'created and ' : ''}linked to ${menuItemName}`
      });

      onClose();
    } catch (error: any) {
      console.error('Error linking recipe:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Link Recipe to {menuItemName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!creatingNew ? (
            <>
              <div>
                <Label>Select Existing Recipe</Label>
                <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a recipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name} - ${recipe.cost.toFixed(2)} cost
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => setCreatingNew(true)} 
                variant="outline" 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Recipe Instead
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label>New Recipe Name</Label>
                <Input
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  placeholder="e.g., Jollof Rice Special"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Ingredients from Kitchen Inventory
                  </Label>
                  <Button onClick={addIngredient} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-end gap-2 p-3 border rounded">
                    <div className="flex-1">
                      <Label className="text-xs">Inventory Item</Label>
                      <Select 
                        value={ingredient.inventory_item_id}
                        onValueChange={(value) => updateIngredient(index, 'inventory_item_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {inventory.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.item_name} - ${item.cost_per_unit}/{item.unit} (Stock: {item.current_quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.quantity_needed || ""}
                        onChange={(e) => updateIngredient(index, 'quantity_needed', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="w-24">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        value={ingredient.unit}
                        disabled
                        placeholder="Unit"
                      />
                    </div>

                    <div className="w-24">
                      <Label className="text-xs">Cost</Label>
                      <Badge variant="outline">
                        ${((ingredient.cost || 0) * ingredient.quantity_needed).toFixed(2)}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => removeIngredient(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {ingredients.length > 0 && (
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Recipe Cost:</span>
                      <span className="text-2xl font-bold text-success">
                        ${calculateTotalCost().toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This cost will be automatically deducted from inventory when the item is sold
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => {
                  setCreatingNew(false);
                  setIngredients([]);
                  setNewRecipeName("");
                }} 
                variant="outline" 
                className="w-full"
              >
                Use Existing Recipe Instead
              </Button>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={loading || (!selectedRecipeId && !creatingNew) || (creatingNew && !newRecipeName.trim())}
            >
              {loading ? "Saving..." : "Save Recipe Link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
