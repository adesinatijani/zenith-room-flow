import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MenuItem } from "@/hooks/useMenuItemsDB";

interface DeleteMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onDelete: (id: string) => Promise<void>;
}

const DeleteMenuItemModal = ({ isOpen, onClose, item, onDelete }: DeleteMenuItemModalProps) => {
  const handleDelete = async () => {
    if (!item) return;
    try {
      await onDelete(item.id);
      onClose();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{item?.name}"? This action cannot be undone and will remove the item from your menu permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Item
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMenuItemModal;