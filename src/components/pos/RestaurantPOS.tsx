import { useState } from "react";
import { 
  Utensils, 
  Wine, 
  Coffee, 
  IceCream,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Clock,
  User,
  Users,
  Receipt,
  Banknote,
  DollarSign,
  Sandwich,
  Fish,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useRestaurantTables, RestaurantTable } from "@/hooks/useRestaurantTables";
import { useOrders, Order } from "@/hooks/useOrders";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useMenuItemsDB } from "@/hooks/useMenuItemsDB";
import AddTableModal from "./AddTableModal";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  is_available: boolean;
  allergens?: string[];
  preparation_time?: number;
  tax_rate?: number;
}

interface OrderItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

const RestaurantPOS = () => {
  const { menuItems, loading: menuLoading } = useMenuItemsDB();
  const { tables, loading: tablesLoading, updateTableStatus, deleteTable } = useRestaurantTables();
  const { orders, loading: ordersLoading, createOrder, addItemToOrder, updateItemQuantity, processPayment, deleteOrder } = useOrders();
  const { rooms, loading: roomsLoading } = useRoomsDB();
  const { settings, formatCurrency } = useGlobalSettings();
  const { toast } = useToast();
  
  const [activeCategory, setActiveCategory] = useState("");
  const [showTableView, setShowTableView] = useState(false);
  const [showRoomView, setShowRoomView] = useState(false);
  const [showGuestTypeModal, setShowGuestTypeModal] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Filter available menu items for restaurant
  const restaurantItems = menuItems.filter(item => item.is_available);

  // Map menu categories to display categories
  const categoryMap = {
    "Main Course": { name: "MAINS", icon: Utensils, color: "bg-red-700 hover:bg-red-800" },
    "Appetizers": { name: "APPETIZERS", icon: Utensils, color: "bg-orange-500 hover:bg-orange-600" },
    "Desserts": { name: "DESSERTS", icon: IceCream, color: "bg-blue-400 hover:bg-blue-500" },
    "Salads": { name: "SALADS", icon: Utensils, color: "bg-purple-500 hover:bg-purple-600" },
    "Soups": { name: "SOUPS", icon: Utensils, color: "bg-teal-500 hover:bg-teal-600" },
    "Sides": { name: "SIDES", icon: Utensils, color: "bg-amber-500 hover:bg-amber-600" },
    "Red Wine": { name: "RED WINE", icon: Wine, color: "bg-red-600 hover:bg-red-700" },
    "White Wine": { name: "WHITE WINE", icon: Wine, color: "bg-yellow-600 hover:bg-yellow-700" },
    "Rosé Wine": { name: "ROSÉ WINE", icon: Wine, color: "bg-pink-500 hover:bg-pink-600" },
    "Sparkling Wine": { name: "SPARKLING", icon: Wine, color: "bg-indigo-500 hover:bg-indigo-600" },
    "Cocktails": { name: "COCKTAILS", icon: Wine, color: "bg-red-500 hover:bg-red-600" },
    "Spirits": { name: "SPIRITS", icon: Wine, color: "bg-amber-700 hover:bg-amber-800" },
    "spirits": { name: "SPIRITS", icon: Wine, color: "bg-amber-700 hover:bg-amber-800" },
    "Beer": { name: "BEER", icon: Coffee, color: "bg-yellow-500 hover:bg-yellow-600" },
    "beer": { name: "BEER", icon: Coffee, color: "bg-yellow-500 hover:bg-yellow-600" },
    "wine": { name: "WINE", icon: Wine, color: "bg-red-600 hover:bg-red-700" },
    "Non-Alcoholic Beverages": { name: "SOFT DRINKS", icon: Coffee, color: "bg-green-500 hover:bg-green-600" },
    "Hot Beverages": { name: "HOT DRINKS", icon: Coffee, color: "bg-brown-500 hover:bg-brown-600" },
    "hot beverages": { name: "HOT DRINKS", icon: Coffee, color: "bg-brown-500 hover:bg-brown-600" },
    "Soft Drinks": { name: "SOFT DRINKS", icon: Coffee, color: "bg-green-500 hover:bg-green-600" },
    "soft drinks": { name: "SOFT DRINKS", icon: Coffee, color: "bg-green-500 hover:bg-green-600" },
    "Alcoholic Beverages": { name: "ALCOHOL", icon: Wine, color: "bg-purple-600 hover:bg-purple-700" },
    "alcoholic beverages": { name: "ALCOHOL", icon: Wine, color: "bg-purple-600 hover:bg-purple-700" },
    "liquor": { name: "LIQUOR", icon: Wine, color: "bg-orange-600 hover:bg-orange-700" },
    "juice": { name: "JUICE", icon: Coffee, color: "bg-orange-400 hover:bg-orange-500" },
    "water": { name: "WATER", icon: Coffee, color: "bg-blue-400 hover:bg-blue-500" },
    "energy drinks": { name: "ENERGY", icon: Coffee, color: "bg-red-400 hover:bg-red-500" },
    "cocktails": { name: "COCKTAILS", icon: Wine, color: "bg-red-500 hover:bg-red-600" },
    "drinks": { name: "DRINKS", icon: Coffee, color: "bg-teal-500 hover:bg-teal-600" },
    "beverages": { name: "BEVERAGES", icon: Coffee, color: "bg-cyan-500 hover:bg-cyan-600" },
  };

  // Get unique categories from menu items
  const availableCategories = [...new Set(restaurantItems.map(item => item.category))]
    .filter(category => categoryMap[category as keyof typeof categoryMap])
    .map(category => ({
      id: category,
      ...categoryMap[category as keyof typeof categoryMap]
    }));

  const filteredItems = restaurantItems.filter(item => 
    item.category === activeCategory
  );

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const addToOrder = async (item: MenuItem) => {
    if (!selectedOrderId || isAddingItem) return;
    
    setIsAddingItem(true);
    try {
      await addItemToOrder(selectedOrderId, item, 1); // Always add quantity of 1
    } catch (error) {
      console.error('Error adding item to order:', error);
      toast({
        title: "Error",
        description: "Failed to add item to order",
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  const updateOrderItemQuantity = async (orderItemId: string, quantity: number) => {
    try {
      await updateItemQuantity(orderItemId, quantity);
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  const getOrderTotal = (order: Order) => {
    return order.total_amount || 0;
  };

  const getSelectedOrderTotals = () => {
    const order = selectedOrder;
    if (!order) return { subtotal: 0, tax: 0, total: 0 };
    
    return {
      subtotal: order.subtotal || 0,
      tax: order.tax_amount || 0,
      total: order.total_amount || 0
    };
  };

  const getGrandTotal = () => {
    return orders.reduce((total, order) => total + getOrderTotal(order), 0);
  };

  const handlePayment = async (paymentMethod: string) => {
    if (!selectedOrderId) return;
    
    try {
      await processPayment(selectedOrderId, paymentMethod);
      setSelectedOrderId(""); // Clear selection after payment
      toast({
        title: "Payment Processed",
        description: `Payment successful via ${paymentMethod}`,
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed", 
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createNewOrder = async (type: 'room' | 'table' | 'standalone', tableId?: string, roomNumber?: string) => {
    if (isCreatingOrder) return; // Prevent double-clicks
    
    setIsCreatingOrder(true);
    try {
      const guestName = type === 'room' ? `Room ${roomNumber}` : 
                       type === 'table' ? `Table ${tables.find(t => t.id === tableId)?.table_number}` :
                       `Guest ${Date.now().toString().slice(-4)}`;
      
      const newOrder = await createOrder(guestName, type, tableId, roomNumber);
      
      if (type === 'table' && tableId) {
        // Only update table status to occupied if it's currently available
        const table = tables.find(t => t.id === tableId);
        if (table && table.status === 'available') {
          await updateTableStatus(tableId, 'occupied');
        }
      }
      
      setSelectedOrderId(newOrder.id);
      setShowGuestTypeModal(false);
      setShowTableView(false);
      setShowRoomView(false);
      
      toast({
        title: "Order Created",
        description: `New ${type} order created for ${guestName}`,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Add Table Modal */}
      {showAddTableModal && (
        <AddTableModal onClose={() => setShowAddTableModal(false)} />
      )}

      {/* Table Selection Modal */}
      {showTableView && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
          <Card className="w-4/5 h-4/5 bg-white">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Select Table</h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddTableModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Table
                  </Button>
                  <Button variant="ghost" onClick={() => setShowTableView(false)}>✕</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 flex-1">
                {tables.map((table) => (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all hover:shadow-lg relative ${
                      table.status === 'available' ? 'border-green-500 hover:bg-green-50' :
                      table.status === 'occupied' ? 'border-red-500 bg-red-50' :
                      table.status === 'reserved' ? 'border-yellow-500 bg-yellow-50' :
                      'border-gray-400 bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedTable(table.id);
                      setShowGuestTypeModal(true);
                    }}
                  >
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-red-100 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete Table ${table.table_number}?`)) {
                          deleteTable(table.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                    <CardContent className="p-4 text-center h-24 flex flex-col justify-center">
                      <h4 className="font-bold text-lg">Table {table.table_number}</h4>
                      <p className="text-sm text-gray-600">{table.seats} seats</p>
                      <Badge 
                        className={`mt-1 ${
                          table.status === 'available' ? 'bg-green-500' :
                          table.status === 'occupied' ? 'bg-red-500' :
                          table.status === 'reserved' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}
                      >
                        {table.status.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Room Selection Modal */}
      {showRoomView && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
          <Card className="w-4/5 h-4/5 bg-white">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Select Room</h3>
                <Button variant="ghost" onClick={() => setShowRoomView(false)}>✕</Button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 flex-1 overflow-auto">
                {rooms.map((room) => (
                  <Card
                    key={room.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      room.status === 'available' ? 'border-green-500 hover:bg-green-50' :
                      room.status === 'occupied' ? 'border-blue-500 hover:bg-blue-50' :
                      room.status === 'maintenance' ? 'border-red-500 bg-red-50' :
                      'border-gray-400 bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedRoom(room.id);
                      setShowGuestTypeModal(true);
                    }}
                  >
                    <CardContent className="p-4 text-center h-24 flex flex-col justify-center">
                      <h4 className="font-bold text-lg">Room {room.room_number}</h4>
                      <p className="text-sm text-gray-600">{room.room_type}</p>
                      <Badge 
                        className={`mt-1 ${
                          room.status === 'available' ? 'bg-green-500' :
                          room.status === 'occupied' ? 'bg-blue-500' :
                          room.status === 'maintenance' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                      >
                        {room.status.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Guest Type Selection Modal */}
      {showGuestTypeModal && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
          <Card className="w-96 bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Select Guest Type</h3>
                <Button variant="ghost" onClick={() => setShowGuestTypeModal(false)}>✕</Button>
              </div>
              
              <div className="space-y-3">
                <Button
                  className="w-full h-16 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
                  disabled={isCreatingOrder}
                  onClick={() => setShowRoomView(true)}
                >
                  <div className="text-center">
                    <div className="font-bold">Select Room</div>
                    <div className="text-xs">Choose room from list</div>
                  </div>
                </Button>
                
                {selectedRoom && (
                  <Button
                    className="w-full h-16 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700"
                    disabled={isCreatingOrder}
                    onClick={() => {
                      const room = rooms.find(r => r.id === selectedRoom);
                      if (room) {
                        createNewOrder('room', undefined, room.room_number);
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className="font-bold">Charge to Room {rooms.find(r => r.id === selectedRoom)?.room_number}</div>
                      <div className="text-xs">Hotel guest room charge</div>
                    </div>
                  </Button>
                )}
                
                {selectedTable && (
                  <Button
                    className="w-full h-16 flex items-center justify-center bg-green-600 hover:bg-green-700"
                    disabled={isCreatingOrder}
                    onClick={() => createNewOrder('table', selectedTable || undefined)}
                  >
                    <div className="text-center">
                      <div className="font-bold">Charge to Table {tables.find(t => t.id === selectedTable)?.table_number}</div>
                      <div className="text-xs">Restaurant table service</div>
                    </div>
                  </Button>
                )}
                
                <Button
                  className="w-full h-16 flex items-center justify-center bg-purple-600 hover:bg-purple-700"
                  disabled={isCreatingOrder}
                  onClick={() => createNewOrder('standalone')}
                >
                  <div className="text-center">
                    <div className="font-bold">Standalone Guest</div>
                    <div className="text-xs">Walk-in customer</div>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Left Panel - Guest Orders */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gray-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">ORDERS</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowTableView(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button size="sm" onClick={() => setShowGuestTypeModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Guest
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-300">
            SERVER: WAITER 1 • {selectedOrder ? 
              selectedOrder.guest_type === 'room' ? `ROOM: ${selectedOrder.room_number}` :
              selectedOrder.guest_type === 'table' ? `TABLE: ${tables.find(t => t.id === selectedOrder.table_id)?.table_number}` :
              'STANDALONE'
              : 'NO ORDER SELECTED'}
          </div>
        </div>

        {/* Orders List */}
        <ScrollArea className="flex-1">
          {orders.map((order) => (
            <div key={`order-${order.id}`} className="border-b">
              <div 
                className={`p-3 cursor-pointer transition-colors ${
                  selectedOrderId === order.id ? 'bg-teal-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 text-white rounded text-xs flex items-center justify-center font-bold ${
                      order.guest_type === 'room' ? 'bg-blue-500' :
                      order.guest_type === 'table' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}>
                      {order.guest_type === 'room' ? 'R' : order.guest_type === 'table' ? 'T' : 'S'}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{order.guest_name}</h3>
                      <p className="text-xs text-gray-500">
                        {order.guest_type === 'room' ? 'Room Service' :
                         order.guest_type === 'table' ? 'Table Service' :
                         'Walk-in'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.order_items && order.order_items.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {order.order_items.length} items
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete order for ${order.guest_name}?`)) {
                          deleteOrder(order.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-1 text-xs">
                    {order.order_items.map((item, itemIndex) => (
                      <div key={`item-${item.id}-${order.id}-${itemIndex}`} className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center font-medium">{item.quantity}</span>
                          <span className="text-gray-700">{item.item_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderItemQuantity(item.id, 0);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedOrderId === order.id && order.order_items && order.order_items.length > 0 && (
                  <div className="mt-3 pt-2 border-t">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Tax:</span>
                      <span>{formatCurrency(order.tax_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-t pt-1 mt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total_amount || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right Panel - Categories and Items */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3">
              <div className="text-sm text-gray-600">SEARCH</div>
            </div>
            <Badge className="bg-teal-500">{selectedOrder?.guest_name || 'SELECT ORDER'}</Badge>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-4 gap-4 h-full">
            {availableCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  className={`${category.color} text-white border-0 rounded-lg h-24 flex flex-col items-center justify-center text-lg font-bold shadow-lg transition-all duration-200 hover:scale-105 ${
                    !selectedOrderId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => selectedOrderId && setActiveCategory(category.id)}
                  disabled={!selectedOrderId}
                >
                  <Icon className="h-8 w-8 mb-2" />
                  <span className="text-sm">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Items Display (Modal-like overlay when category selected) */}
        {activeCategory && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <Card className="w-4/5 h-4/5 bg-white">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    {availableCategories.find(c => c.id === activeCategory)?.name || activeCategory.toUpperCase()}
                  </h3>
                  <Button 
                    variant="ghost"
                    onClick={() => setActiveCategory("")}
                    className="text-gray-500"
                  >
                    ✕
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  {!selectedOrderId ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No Order Selected</h4>
                        <p className="text-gray-500">Please create an order first by clicking "Table" or "Guest"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {filteredItems.map((item) => (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                            isAddingItem ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          onClick={() => {
                            if (!isAddingItem) {
                              addToOrder(item);
                              setActiveCategory("");
                            }
                          }}
                        >
                          <CardContent className="p-4 text-center">
                            <h4 className="font-bold text-sm mb-2">{item.name}</h4>
                             <div className="text-lg font-bold text-green-600 mb-1">
                              {formatCurrency(item.price)}
                            </div>
                            {item.preparation_time && (
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {item.preparation_time}min
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Payment Section */}
        <div className="bg-white border-t p-6">
          {selectedOrderId ? (
            <>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(getSelectedOrderTotals().subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Tax (varies by item):</span>
                  <span>{formatCurrency(getSelectedOrderTotals().tax)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(getSelectedOrderTotals().total)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 mb-4">
              <p className="text-lg">Select an order to process payment</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <Button 
              className="h-16 flex flex-col items-center bg-green-600 hover:bg-green-700"
              onClick={() => handlePayment('credit')}
              disabled={!selectedOrderId}
            >
              <CreditCard className="h-6 w-6 mb-1" />
              <span className="text-xs">CREDIT</span>
            </Button>
            <Button 
              className="h-16 flex flex-col items-center bg-blue-600 hover:bg-blue-700"
              onClick={() => handlePayment('cash')}
              disabled={!selectedOrderId}
            >
              <DollarSign className="h-6 w-6 mb-1" />
              <span className="text-xs">CASH</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center"
              onClick={() => handlePayment('bank_transfer')}
              disabled={!selectedOrderId}
            >
              <Banknote className="h-6 w-6 mb-1" />
              <span className="text-xs">BANK TRANSFER</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center"
              onClick={() => handlePayment('no_receipt')}
              disabled={!selectedOrderId}
            >
              <Receipt className="h-6 w-6 mb-1" />
              <span className="text-xs">NO RECEIPT</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPOS;