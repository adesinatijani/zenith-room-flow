import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  cost: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: { name: string; quantity: number; unit: string; cost: number }[];
  instructions: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useRecipesDB = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching recipes",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setRecipes(data as Recipe[] || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRecipes();
      setLoading(false);
    };

    loadData();

    // Real-time subscription
    const recipesChannel = supabase
      .channel("recipes_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "recipes" }, fetchRecipes)
      .subscribe();

    return () => {
      supabase.removeChannel(recipesChannel);
    };
  }, []);

  const addRecipe = async (recipeData: Omit<Recipe, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("recipes").insert([recipeData]);

    if (error) {
      toast({
        title: "Error adding recipe",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Recipe added successfully" });
  };

  const updateRecipe = async (id: string, recipeData: Partial<Recipe>) => {
    const { error } = await supabase
      .from("recipes")
      .update(recipeData)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating recipe",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Recipe updated successfully" });
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting recipe",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Recipe deleted successfully" });
  };

  const getRecipesByCategory = (category: string) => {
    return recipes.filter(r => r.category === category);
  };

  const getRecipeById = (id: string) => {
    return recipes.find(r => r.id === id);
  };

  return {
    recipes,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipesByCategory,
    getRecipeById,
  };
};
