import { useState } from "react";
import { 
  ChefHat, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  DollarSign,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AddRecipeModal from "@/components/recipe/AddRecipeModal";
import EditRecipeModal from "@/components/recipe/EditRecipeModal";
import DeleteRecipeModal from "@/components/recipe/DeleteRecipeModal";
import { useRecipesDB } from "@/hooks/useRecipesDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

const RecipeManagement = () => {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipesDB();
  const { formatCurrency } = useGlobalSettings();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipes[0] | null>(null);

  const categories = [
    "Appetizers", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Sides"
  ];

  // Handler functions
  const handleAddRecipe = async (newRecipe: any) => {
    try {
      await addRecipe(newRecipe);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  const handleEditRecipe = async (recipeData: any) => {
    if (selectedRecipe) {
      try {
        await updateRecipe(selectedRecipe.id, recipeData);
        setIsEditDialogOpen(false);
        setSelectedRecipe(null);
      } catch (error) {
        console.error("Error updating recipe:", error);
      }
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId);
      setIsDeleteDialogOpen(false);
      setSelectedRecipe(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const openEditDialog = (recipe: typeof recipes[0]) => {
    setSelectedRecipe(recipe);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (recipe: typeof recipes[0]) => {
    setSelectedRecipe(recipe);
    setIsDeleteDialogOpen(true);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const RecipeCard = ({ recipe }: { recipe: typeof recipes[0] }) => (
    <Card className="card-luxury">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{recipe.name}</CardTitle>
            <CardDescription className="mt-1">{recipe.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => openEditDialog(recipe)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => openDeleteDialog(recipe)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{recipe.category}</Badge>
            <Badge variant="outline" className="text-green-600">
              <DollarSign className="h-3 w-3 mr-1" />
              ${recipe.cost.toFixed(2)}
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {recipe.prep_time + recipe.cook_time}min
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {recipe.servings} servings
            </Badge>
            <Badge variant={recipe.difficulty === "Easy" ? "default" : recipe.difficulty === "Medium" ? "secondary" : "destructive"}>
              {recipe.difficulty}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Prep Time:</span> {recipe.prep_time}min
            </div>
            <div>
              <span className="font-medium">Cook Time:</span> {recipe.cook_time}min
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Ingredients ({recipe.ingredients.length})</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                <div key={idx}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </div>
              ))}
              {recipe.ingredients.length > 4 && (
                <div className="text-accent">+{recipe.ingredients.length - 4} more...</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-accent" />
            Recipe Management
          </h1>
          <p className="text-muted-foreground">Manage your restaurant recipes and ingredient costs</p>
        </div>
        <Button className="button-luxury" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{recipes.length}</p>
                <p className="text-sm text-muted-foreground">Total Recipes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(13.63)}</p>
                <p className="text-sm text-muted-foreground">Avg Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">27</p>
                <p className="text-sm text-muted-foreground">Avg Time (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-muted-foreground">Try adjusting your search or add a new recipe</p>
        </div>
      )}

      {/* Modals */}
      <AddRecipeModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddRecipe}
      />

      <EditRecipeModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        recipe={selectedRecipe}
        onSave={handleEditRecipe}
      />

      <DeleteRecipeModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        recipe={selectedRecipe}
        onDelete={handleDeleteRecipe}
      />
    </div>
  );
};

export default RecipeManagement;