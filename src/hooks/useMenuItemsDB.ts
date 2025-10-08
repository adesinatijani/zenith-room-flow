import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category: string;
  preparation_time: number;
  calories?: number;
  is_popular: boolean;
  is_available: boolean;
  tracks_inventory?: boolean;
  inventory_item_id?: string;
  allergens: string[];
  ingredients: string[];
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const useMenuItemsDB = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;

      setMenuItems([...menuItems, data]);
      toast({
        title: "Success",
        description: "Menu item added successfully"
      });
      return data;
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMenuItems(menuItems.map(item => item.id === id ? data : item));
      toast({
        title: "Success",
        description: "Menu item updated successfully"
      });
      return data;
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMenuItems(menuItems.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMenuItems();

    // Subscribe to real-time changes for menu_items
    const channel = supabase
      .channel('menu-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items'
        },
        (payload) => {
          console.log('Menu item change detected:', payload);
          if (payload.eventType === 'INSERT') {
            setMenuItems(current => [...current, payload.new as MenuItem]);
          } else if (payload.eventType === 'UPDATE') {
            setMenuItems(current => 
              current.map(item => 
                item.id === payload.new.id ? payload.new as MenuItem : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMenuItems(current => 
              current.filter(item => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    menuItems,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems
  };
};
