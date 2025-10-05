import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/hooks/useRecipesDB";

interface DeleteRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onDelete: (recipeId: string) => void;
}

const DeleteRecipeModal = ({ isOpen, onClose, recipe, onDelete }: DeleteRecipeModalProps) => {
  const { toast } = useToast();

  const handleDelete = () => {
    if (recipe) {
      onDelete(recipe.id);
      toast({
        title: "Recipe deleted",
        description: `${recipe.name} has been removed from your recipes.`,
        variant: "destructive"
      });
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{recipe?.name}"? This action cannot be undone and will remove the recipe permanently along with all its ingredients and instructions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Recipe
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRecipeModal;