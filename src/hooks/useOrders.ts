import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MenuItem } from '@/hooks/useMenuItems';

export interface Order {
  id: string;
  table_id: string | null;
  guest_name: string;
  guest_type: 'room' | 'table' | 'standalone';
  room_number: string | null;
  status: 'active' | 'paid' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
  special_instructions: string | null;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  created_at: string;
  updated_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    guestName: string,
    guestType: 'room' | 'table' | 'standalone',
    tableId?: string,
    roomNumber?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          table_id: tableId || null,
          guest_name: guestName,
          guest_type: guestType,
          room_number: roomNumber || null,
          status: 'active',
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newOrder = { ...data, order_items: [] } as Order;
      setOrders(prev => [newOrder, ...prev]);
      
      toast({
        title: "Success",
        description: `Order created for ${guestName}`,
      });
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addItemToOrder = async (orderId: string, item: MenuItem, quantity: number = 1) => {
    try {
      // Check if item already exists in order
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const existingItem = order.order_items?.find(oi => oi.item_name === item.name);

      if (existingItem) {
        // Update existing item quantity
        const { data, error } = await supabase
          .from('order_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;

        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? {
                ...o,
                order_items: o.order_items?.map(oi => 
                  oi.id === existingItem.id ? data as OrderItem : oi
                ) || []
              }
            : o
        ));
      } else {
        // Add new item to order
        const { data, error } = await supabase
          .from('order_items')
          .insert([{
            order_id: orderId,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity,
            status: 'pending'
          }])
          .select()
          .single();

        if (error) throw error;

        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? {
                ...o,
                order_items: [...(o.order_items || []), data as OrderItem]
              }
            : o
        ));
      }

      // Update order totals
      await updateOrderTotals(orderId);

    } catch (error) {
      console.error('Error adding item to order:', error);
      toast({
        title: "Error",
        description: "Failed to add item to order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItemQuantity = async (orderItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('order_items')
          .delete()
          .eq('id', orderItemId);

        if (error) throw error;

        setOrders(prev => prev.map(o => ({
          ...o,
          order_items: o.order_items?.filter(oi => oi.id !== orderItemId) || []
        })));
      } else {
        const { data, error } = await supabase
          .from('order_items')
          .update({ quantity })
          .eq('id', orderItemId)
          .select()
          .single();

        if (error) throw error;

        setOrders(prev => prev.map(o => ({
          ...o,
          order_items: o.order_items?.map(oi => 
            oi.id === orderItemId ? data as OrderItem : oi
          ) || []
        })));
      }

      // Find and update order totals using fresh data
      const ordersToUpdate = orders.filter(o => 
        o.order_items?.some(oi => oi.id === orderItemId)
      );
      
      for (const order of ordersToUpdate) {
        await updateOrderTotals(order.id);
      }

    } catch (error) {
      console.error('Error updating item quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrderTotals = async (orderId: string) => {
    try {
      // Fetch fresh order items from database to ensure accuracy
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      const subtotal = (orderItems || []).reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      const taxAmount = subtotal * 0.085; // 8.5% tax
      const totalAmount = subtotal + taxAmount;

      const { error } = await supabase
        .from('orders')
        .update({
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state with calculated values
      setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { ...o, subtotal, tax_amount: taxAmount, total_amount: totalAmount }
          : o
      ));

    } catch (error) {
      console.error('Error updating order totals:', error);
      throw error;
    }
  };

  const processPayment = async (orderId: string, paymentMethod: string) => {
    try {
      // Update order status and payment method
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_method: paymentMethod
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Send kitchen orders for items that need preparation
      await sendKitchenOrder(orderId);

      // Update inventory for beverages and drinks
      await updateInventoryForOrder(orderId);

      // Remove from local state
      setOrders(prev => prev.filter(o => o.id !== orderId));

      toast({
        title: "Payment Processed",
        description: "Order has been paid and sent to kitchen",
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      // First delete all order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Remove from local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendKitchenOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Categories that need kitchen preparation
      const kitchenCategories = [
        'Main Course', 'Appetizers', 'Desserts', 'Salads', 'Soups', 'Sides',
        'Cocktails', 'Hot Beverages'
      ];

      const kitchenItems = order.order_items?.filter(item => 
        kitchenCategories.includes(item.item_category)
      );

      if (kitchenItems && kitchenItems.length > 0) {
        const { error } = await supabase
          .from('kitchen_orders')
          .insert({
            order_id: orderId,
            table_number: order.table_id ? 
              `Table ${orders.find(o => o.table_id === order.table_id)?.table_id || ''}` : 
              order.guest_type === 'room' ? `Room ${order.room_number}` : 'Standalone',
            guest_name: order.guest_name,
            items: kitchenItems as any,
            status: 'received',
            priority: 1,
            estimated_time: kitchenItems.length * 10 // Estimate 10 mins per item
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error sending kitchen order:', error);
      throw error;
    }
  };

  const updateInventoryForOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Categories that affect inventory (beverages and drinks)
      const inventoryCategories = [
        'Soft Drinks', 'Alcoholic Beverages', 'Beer', 'Spirits', 
        'Red Wine', 'White Wine', 'Rosé Wine', 'Sparkling Wine'
      ];

      const inventoryItems = order.order_items?.filter(item => 
        inventoryCategories.includes(item.item_category)
      );

      if (inventoryItems && inventoryItems.length > 0) {
        for (const item of inventoryItems) {
          // Update inventory quantity using RPC function
          const { error } = await supabase.rpc('update_inventory_quantity', {
            item_name_param: item.item_name,
            quantity_change: -item.quantity
          });

          if (error) {
            console.error(`Error updating inventory for ${item.item_name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
         (payload) => {
           console.log('Orders realtime event:', payload.eventType, payload.new);
           if (payload.eventType === 'INSERT' && payload.new) {
             setOrders(prev => {
               // Check if order already exists to prevent duplicates
               const orderExists = prev.some(order => order.id === (payload.new as any).id);
               if (orderExists) {
                 console.log('Duplicate order prevented:', (payload.new as any).id);
                 return prev;
               }
               console.log('Adding new order:', (payload.new as any).id);
               return [{ ...payload.new as Order, order_items: [] }, ...prev];
             });
           } else if (payload.eventType === 'UPDATE' && payload.new) {
             setOrders(prev => prev.map(order => 
               order.id === (payload.new as any).id ? { ...order, ...payload.new as Order } : order
             ));
           } else if (payload.eventType === 'DELETE' && payload.old) {
             setOrders(prev => prev.filter(order => order.id !== (payload.old as any).id));
           }
         }
      )
      .subscribe();

    const itemsChannel = supabase
      .channel('order_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
         (payload) => {
           console.log('Order items realtime event:', payload.eventType, payload.new);
           if (payload.eventType === 'INSERT' && payload.new) {
             setOrders(prev => prev.map(order => {
               if (order.id === (payload.new as any).order_id) {
                 // Check if item already exists to prevent duplicates
                 const itemExists = order.order_items?.some(item => item.id === (payload.new as any).id);
                 if (itemExists) {
                   console.log('Duplicate item prevented:', (payload.new as any).id);
                   return order;
                 }
                 console.log('Adding item:', (payload.new as any).id, 'to order:', order.id);
                 return {
                   ...order,
                   order_items: [...(order.order_items || []), payload.new as OrderItem]
                 };
               }
               return order;
             }));
           } else if (payload.eventType === 'UPDATE' && payload.new) {
             setOrders(prev => prev.map(order => ({
               ...order,
               order_items: order.order_items?.map(item => 
                 item.id === (payload.new as any).id ? payload.new as OrderItem : item
               ) || []
             })));
           } else if (payload.eventType === 'DELETE' && payload.old) {
             setOrders(prev => prev.map(order => ({
               ...order,
               order_items: order.order_items?.filter(item => item.id !== (payload.old as any).id) || []
             })));
           }
         }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, []); // Remove orders from dependency array to prevent infinite loop

  return {
    orders,
    loading,
    createOrder,
    addItemToOrder,
    updateItemQuantity,
    processPayment,
    deleteOrder,
    refetch: fetchOrders
  };
};