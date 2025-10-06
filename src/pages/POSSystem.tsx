import { useState, useEffect } from "react";
import { 
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Search,
  User,
  Receipt,
  Banknote,
  Users,
  DollarSign,
  CheckCircle,
  X,
  UserPlus,
  Edit3,
  Calendar,
  Bed,
  Building,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useRestaurantTables } from "@/hooks/useRestaurantTables";
import { useRoomsDB } from "@/hooks/useRoomsDB";
import { useHalls } from "@/hooks/useHalls";
import { useGuests, RegisteredGuest } from "@/hooks/useGuests";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { TableManagementModal } from "@/components/pos/TableManagementModal";
import { AdminPOSSettings } from "@/components/pos/AdminPOSSettings";
import { useMenuItemsDB } from "@/hooks/useMenuItemsDB";
import { supabase } from "@/integrations/supabase/client";
import { createAccountingEntryForPayment } from "@/utils/accountingIntegration";

interface POSItem {
  id: string;
  name: string;
  price: number;
  category: string;
  color: string;
  isAvailable?: boolean;
  bookedDays?: number;
  roomType?: string;
  capacity?: number;
  amenities?: string[];
}

interface POSGuest {
  id: string;
  name: string;
  registeredGuestId?: string;
  table?: string;
  items: Array<POSItem & { quantity: number }>;
}

interface PaymentState {
  method: string;
  processing: boolean;
  completed: boolean;
  printReceipt: boolean;
}

const POSSystem = () => {
  const { formatCurrency, settings } = useGlobalSettings();
  const navigate = useNavigate();
  const { rooms, getAvailableRooms, createRoomBooking } = useRoomsDB();
  const { halls, getAvailableHalls } = useHalls();
  const { guests: registeredGuests, getAvailableGuests } = useGuests();
  const { tables } = useRestaurantTables();
  const { menuItems } = useMenuItemsDB();
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedGuest, setSelectedGuest] = useState("1");
  const [paymentState, setPaymentState] = useState<PaymentState>({
    method: "",
    processing: false,
    completed: false,
    printReceipt: true,
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "amenities" });
  const [selectedRegisteredGuest, setSelectedRegisteredGuest] = useState<RegisteredGuest | null>(null);
  const [showGuestSelection, setShowGuestSelection] = useState(false);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInGuest, setWalkInGuest] = useState({ name: "", phone: "", email: "" });
  const [posGuests, setPosGuests] = useState<POSGuest[]>([]);
  const [showChargeDropdown, setShowChargeDropdown] = useState(false);

  // Check for hall bookings from localStorage and add to guest orders
  useState(() => {
    const hallBookings = JSON.parse(localStorage.getItem('hallBookings') || '[]');
    if (hallBookings.length > 0) {
      hallBookings.forEach((booking: any) => {
        const existingGuest = posGuests.find(g => g.name === booking.guestName);
        const hallItem: POSItem & { quantity: number } = {
          id: booking.id,
          name: booking.name,
          price: booking.price,
          category: booking.category,
          color: "bg-green-600",
          isAvailable: true,
          bookedDays: booking.days,
          quantity: booking.days
        };

        if (existingGuest) {
          // Add to existing guest
          setPosGuests(prev => prev.map(guest =>
            guest.name === booking.guestName
              ? { ...guest, items: [...guest.items, hallItem] }
              : guest
          ));
        } else {
          // Create new guest
          const newGuest: POSGuest = {
            id: `guest-${Date.now()}-${booking.guestName}`,
            name: booking.guestName,
            registeredGuestId: registeredGuests.find(g => g.name === booking.guestName)?.id,
            items: [hallItem]
          };
          setPosGuests(prev => [...prev, newGuest]);
        }
      });
      
      // Clear localStorage after adding to orders
      localStorage.removeItem('hallBookings');
      
      toast({
        title: "Hall Bookings Added",
        description: `${hallBookings.length} hall booking(s) added to order list`,
      });
    }
  });

  const categories = [
    { id: "all", name: "ALL SERVICES", color: "bg-gray-500" },
    { id: "accommodation", name: "ACCOMMODATION", color: "bg-blue-600" },
    { id: "facilities", name: "FACILITIES", color: "bg-green-600" },
    { id: "amenities", name: "AMENITIES", color: "bg-purple-600" },
    { id: "booking", name: "BOOKING", color: "bg-orange-600" },
  ];

  // Generate hotel service items from rooms, halls, and menu items
  const generateHotelItems = () => {
    const roomItems: POSItem[] = rooms
      .filter(room => room.status === "available")
      .map(room => ({
        id: `room-${room.id}`,
        name: `ROOM ${room.room_number}`,
        price: room.rate,
        category: "accommodation",
        color: "bg-blue-600",
        isAvailable: true,
        bookedDays: 1, // Default to 1 night
        roomType: room.room_type,
        amenities: room.amenities
      }));

    const hallItems: POSItem[] = halls
      .filter(hall => hall.availability === "available")
      .map(hall => ({
        id: `hall-${hall.id}`,
        name: hall.name.toUpperCase(),
        price: hall.hourlyRate,
        category: "facilities",
        color: "bg-green-600",
        isAvailable: true,
        bookedDays: hall.bookedDays,
        capacity: hall.capacity,
        amenities: hall.amenities
      }));

    // Add menu items from restaurant menu
    const menuItemsList: POSItem[] = menuItems
      .filter(item => item.is_available)
      .map(item => ({
        id: `menu-${item.id}`,
        name: item.name.toUpperCase(),
        price: item.price,
        category: item.category === 'main' || item.category === 'appetizer' || item.category === 'dessert' 
          ? 'amenities' 
          : item.category,
        color: "bg-orange-500",
        isAvailable: item.is_available
      }));

    const baseItems: POSItem[] = [
      { id: "gym", name: "GYM", price: 25.00, category: "facilities", color: "bg-green-500", isAvailable: true },
      { id: "game-center", name: "GAME CENTER", price: 15.00, category: "facilities", color: "bg-green-700", isAvailable: true },
      { id: "extra-towel", name: "EXTRA TOWEL", price: 5.00, category: "amenities", color: "bg-purple-600", isAvailable: true },
      { id: "laundry", name: "LAUNDRY", price: 20.00, category: "amenities", color: "bg-purple-500", isAvailable: true },
      { id: "booking-page", name: "MAKE BOOKING", price: 0, category: "booking", color: "bg-orange-600", isAvailable: true },
    ];

    return [...roomItems, ...hallItems, ...menuItemsList, ...baseItems];
  };

  const [items, setItems] = useState<POSItem[]>([]);
  
  // Update items when rooms, halls, or menu items change
  useEffect(() => {
    setItems(generateHotelItems());
  }, [rooms, halls, menuItems]);

  const filteredItems = activeCategory === "all" 
    ? items 
    : items.filter(item => item.category === activeCategory);

  const currentGuest = posGuests.find(g => g.id === selectedGuest);

  const addItemToGuest = (item: POSItem) => {
    if (!currentGuest) return;
    
    // Handle booking navigation
    if (item.id === "booking-page") {
      navigate('/booking');
      return;
    }
    
    // Check if item is available
    if (item.isAvailable === false) {
      toast({
        title: "Service Unavailable",
        description: `${item.name} is currently not available`,
        variant: "destructive",
      });
      return;
    }
    
    setPosGuests(prev => prev.map(guest => {
      if (guest.id === selectedGuest) {
        const existingItem = guest.items.find(i => i.id === item.id);
        if (existingItem) {
          return {
            ...guest,
            items: guest.items.map(i => 
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        } else {
          return {
            ...guest,
            items: [...guest.items, { ...item, quantity: 1 }]
          };
        }
      }
      return guest;
    }));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!currentGuest) return;
    
    setPosGuests(prev => prev.map(guest => {
      if (guest.id === selectedGuest) {
        if (quantity <= 0) {
          return {
            ...guest,
            items: guest.items.filter(i => i.id !== itemId)
          };
        }
        return {
          ...guest,
          items: guest.items.map(i => 
            i.id === itemId ? { ...i, quantity } : i
          )
        };
      }
      return guest;
    }));
  };

  const getGuestTotal = (guest: POSGuest) => {
    return guest.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalTax = (subtotal: number) => {
    return subtotal * (settings.tax_rate || 7.5) / 100;
  };

  // Payment Functions
  const handlePayment = async (method: string) => {
    if (!currentGuest || currentGuest.items.length === 0) return;
    
    setPaymentState(prev => ({ ...prev, method, processing: true }));
    setShowPaymentDialog(true);
    
    // Simulate payment processing with different methods
    const processingTime = method === "MOBILE_MONEY" ? 3000 : method === "BANK" ? 4000 : 2000;
    
    setTimeout(async () => {
      setPaymentState(prev => ({ ...prev, processing: false, completed: true }));
      
      const subtotal = getGuestTotal(currentGuest);
      const tax = getTotalTax(subtotal);
      const total = subtotal + tax;
      const currency = method === "MOBILE_MONEY" || method === "BANK" ? "₦" : "$";
      
      // Save order to database
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            guest_name: currentGuest.name,
            guest_type: 'walk-in',
            room_number: currentGuest.table || null,
            status: 'paid',
            subtotal: subtotal,
            tax_amount: tax,
            total_amount: total,
            payment_method: method.toLowerCase()
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Save order items
        const orderItems = currentGuest.items.map(item => ({
          order_id: order.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity,
          status: 'completed'
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Create accounting entry for POS sale
        await createAccountingEntryForPayment({
          amount: total,
          description: `POS Sale - ${currentGuest.name}`,
          source_type: 'pos_order',
          source_id: order.id,
          reference_number: `POS-${order.id.slice(0, 8)}`,
          payment_method: method,
          guest_name: currentGuest.name
        });

        toast({
          title: "Payment Successful",
          description: `Payment of ${currency}${total.toFixed(2)} processed via ${method}`,
        });
      } catch (error) {
        console.error('Failed to save order:', error);
        toast({
          title: "Warning",
          description: "Payment processed but order not saved to records",
          variant: "destructive"
        });
      }
      
      // Process room check-ins for accommodation items
      const roomItems = currentGuest.items.filter(item => item.category === "accommodation");
      
      for (const roomItem of roomItems) {
        if (roomItem.id.startsWith('room-')) {
          const roomId = roomItem.id.replace('room-', '');
          const checkOutDate = new Date();
          checkOutDate.setDate(checkOutDate.getDate() + roomItem.quantity);
          
          try {
            await createRoomBooking({
              room_id: roomId,
              guest_name: currentGuest.name,
              check_out_date: checkOutDate.toISOString().split('T')[0],
              nights: roomItem.quantity,
              total_amount: roomItem.price * roomItem.quantity,
              special_requests: `Booked via POS - ${method} payment`
            });
          } catch (error) {
            console.error('Failed to create room booking:', error);
          }
        }
      }
      
      // Remove the guest completely after payment
      setPosGuests(prev => prev.filter(guest => guest.id !== selectedGuest));
      
      // If no guests left, reset selected guest
      const remainingGuests = posGuests.filter(guest => guest.id !== selectedGuest);
      if (remainingGuests.length === 0) {
        setSelectedGuest("");
      } else {
        setSelectedGuest(remainingGuests[0].id);
      }
      
      setTimeout(() => {
        setShowPaymentDialog(false);
        setPaymentState({ method: "", processing: false, completed: false, printReceipt: true });
      }, 2000);
    }, processingTime);
  };

  const handleCancel = () => {
    if (currentGuest && currentGuest.items.length > 0) {
      setPosGuests(prev => prev.map(guest =>
        guest.id === selectedGuest 
          ? { ...guest, items: [] }
          : guest
      ));
      
      toast({
        title: "Order Cancelled",
        description: "The current order has been cancelled.",
        variant: "destructive",
      });
    }
  };

  const handleSettle = () => {
    if (!currentGuest || currentGuest.items.length === 0) return;
    
    toast({
      title: "Order Settled",
      description: "Order has been settled and moved to pending payment.",
    });
  };

  const handleDeleteGuest = (guestId: string) => {
    const guestToDelete = posGuests.find(g => g.id === guestId);
    if (!guestToDelete) return;

    setPosGuests(prev => prev.filter(guest => guest.id !== guestId));
    
    // If deleted guest was selected, select another guest or clear selection
    if (selectedGuest === guestId) {
      const remainingGuests = posGuests.filter(guest => guest.id !== guestId);
      if (remainingGuests.length > 0) {
        setSelectedGuest(remainingGuests[0].id);
      } else {
        setSelectedGuest("");
      }
    }
    
    toast({
      title: "Guest Deleted",
      description: `${guestToDelete.name} has been removed from the order list.`,
      variant: "destructive",
    });
  };

  const handleChargeToRoom = (roomId: string) => {
    if (!currentGuest || currentGuest.items.length === 0) return;
    
    const room = rooms.find(r => r.id === roomId);
    const roomNumber = room ? room.room_number : roomId;
    
    toast({
      title: "Charged to Room",
      description: `Order charged to Room ${roomNumber}`,
    });
    
    // Clear the guest's order after charging
    setPosGuests(prev => prev.map(guest =>
      guest.id === selectedGuest 
        ? { ...guest, items: [] }
        : guest
    ));
  };

  const handleChargeToTable = (tableId: string) => {
    if (!currentGuest || currentGuest.items.length === 0) return;
    
    const table = tables.find(t => t.id === tableId);
    const tableNumber = table ? table.table_number : tableId;
    
    toast({
      title: "Charged to Table",
      description: `Order charged to Table ${tableNumber}`,
    });
    
    // Clear the guest's order after charging
    setPosGuests(prev => prev.map(guest =>
      guest.id === selectedGuest 
        ? { ...guest, items: [] }
        : guest
    ));
  };

  const toggleReceipt = () => {
    setPaymentState(prev => ({ ...prev, printReceipt: !prev.printReceipt }));
    toast({
      title: paymentState.printReceipt ? "Receipt Disabled" : "Receipt Enabled",
      description: paymentState.printReceipt ? "No receipt will be printed" : "Receipt will be printed",
    });
  };

  const addNewItem = () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newServiceItem: POSItem = {
      id: `custom-${Date.now()}`,
      name: newItem.name.toUpperCase(),
      price: parseFloat(newItem.price),
      category: newItem.category,
      color: newItem.category === "accommodation" ? "bg-blue-600" : 
             newItem.category === "facilities" ? "bg-green-600" : "bg-purple-600"
    };

    setItems(prev => [...prev, newServiceItem]);
    setNewItem({ name: "", price: "", category: "amenities" });
    setShowAddItemDialog(false);
    
    toast({
      title: "Service Added",
      description: `${newServiceItem.name} has been added to the menu`,
    });
  };

  const addWalkInGuest = () => {
    if (!walkInGuest.name.trim()) {
      toast({
        title: "Error",
        description: "Guest name is required",
        variant: "destructive",
      });
      return;
    }

    const newPosGuest: POSGuest = {
      id: `walkin-${Date.now()}`,
      name: walkInGuest.name.trim(),
      table: `Guest ${posGuests.length + 1}`,
      items: []
    };

    setPosGuests(prev => [...prev, newPosGuest]);
    setSelectedGuest(newPosGuest.id);
    setWalkInGuest({ name: "", phone: "", email: "" });
    setShowWalkInForm(false);
    
    toast({
      title: "Walk-in Guest Added",
      description: `${walkInGuest.name} has been added to POS system`,
    });
  };

  // Add global functions for external booking integrations
  useEffect(() => {
    // Global function to add hall bookings from Hall Management
    (window as any).addHallBookingToOrder = (hallBooking: any, days: number) => {
      const hallItem: POSItem & { quantity: number } = {
        id: hallBooking.id,
        name: hallBooking.name,
        price: hallBooking.price,
        category: hallBooking.category,
        color: "bg-green-600",
        isAvailable: true,
        bookedDays: days,
        quantity: days
      };

      // Find or create guest
      const existingGuest = posGuests.find(g => g.name === hallBooking.guestName);
      if (existingGuest) {
        setPosGuests(prev => prev.map(guest =>
          guest.name === hallBooking.guestName
            ? { ...guest, items: [...guest.items, hallItem] }
            : guest
        ));
      } else {
        const newGuest: POSGuest = {
          id: `guest-${Date.now()}-${hallBooking.guestName}`,
          name: hallBooking.guestName,
          registeredGuestId: registeredGuests.find(g => g.name === hallBooking.guestName)?.id,
          items: [hallItem]
        };
        setPosGuests(prev => [...prev, newGuest]);
      }
    };

    // Global function to add room bookings from Room Management
    (window as any).addRoomBookingToOrder = (roomBooking: any, nights: number) => {
      const roomItem: POSItem & { quantity: number } = {
        id: roomBooking.id,
        name: roomBooking.name,
        price: roomBooking.price,
        category: roomBooking.category,
        color: "bg-blue-600",
        isAvailable: true,
        bookedDays: nights,
        quantity: nights
      };

      // Find or create guest
      const existingGuest = posGuests.find(g => g.name === roomBooking.guestName);
      if (existingGuest) {
        setPosGuests(prev => prev.map(guest =>
          guest.name === roomBooking.guestName
            ? { ...guest, items: [...guest.items, roomItem] }
            : guest
        ));
      } else {
        const newGuest: POSGuest = {
          id: `guest-${Date.now()}-${roomBooking.guestName}`,
          name: roomBooking.guestName,
          registeredGuestId: registeredGuests.find(g => g.name === roomBooking.guestName)?.id,
          items: [roomItem]
        };
        setPosGuests(prev => [...prev, newGuest]);
      }
    };

    return () => {
      delete (window as any).addHallBookingToOrder;
      delete (window as any).addRoomBookingToOrder;
    };
  }, [posGuests, registeredGuests]);

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Guest Orders */}
      <div className="w-80 bg-card border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Services</h2>
          </div>
          <div className="text-sm text-muted-foreground mb-2">SERVER: Staff Member</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="SEARCH" className="pl-10" />
          </div>
        </div>

        {/* Guest Selection */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            <span className="font-medium">GUEST {posGuests.length} OF 3</span>
          </div>
          <div className="space-y-2">
            {posGuests.length > 0 ? (
              posGuests.map((guest, index) => (
                <div key={guest.id} className="flex items-center gap-2">
                  <Button
                    variant={selectedGuest === guest.id ? "default" : "outline"}
                    className={`flex-1 justify-start ${
                      selectedGuest === guest.id ? "bg-accent text-accent-foreground" : ""
                    }`}
                    onClick={() => setSelectedGuest(guest.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{guest.name}</span>
                    </div>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="p-1 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Guest
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No guests added yet</p>
                <p className="text-xs">Add a registered guest to start an order</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowGuestSelection(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Registered Guest
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowWalkInForm(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Add Walk-in Guest
            </Button>
          </div>
        </div>

        {/* Current Guest Order */}
        <ScrollArea className="flex-1">
          {currentGuest && (
            <div className="p-4">
              <h3 className="font-medium mb-4 text-accent">{currentGuest.name}</h3>
              <div className="space-y-3">
                {currentGuest.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center justify-between py-2 border-b border-border/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{index + 1}.</span>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        {formatCurrency(item.price)} {item.category === "accommodation" && item.quantity > 1 ? "per night" : "each"}
                        {item.category === "accommodation" && item.quantity > 1 && (
                          <span className="block text-green-600">
                            {item.quantity} consecutive nights from payment date
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.category === "accommodation" && item.quantity > 1 
                            ? `${item.quantity}d` 
                            : item.quantity
                          }
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <div className="font-bold text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Total & Payment */}
        {currentGuest && currentGuest.items.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-2xl font-bold">
                <span>{formatCurrency(getGuestTotal(currentGuest))}</span>
                <span className="text-sm font-normal">
                  TAX {formatCurrency(getTotalTax(getGuestTotal(currentGuest)))}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant={paymentState.printReceipt ? "outline" : "default"} 
                size="sm"
                onClick={toggleReceipt}
              >
                <Receipt className="h-4 w-4" />
                <span className="text-xs">
                  {paymentState.printReceipt ? "RECEIPT" : "NO RECEIPT"}
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("BANK_TRANSFER")}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">BANK</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handlePayment("CARD")}
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">CARD</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span className="text-xs">CHARGE</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Room Charging Options */}
                  {rooms.filter(r => r.status === 'occupied').map((room) => (
                    <DropdownMenuItem 
                      key={room.id} 
                      onClick={() => handleChargeToRoom(room.id)}
                    >
                      <Bed className="h-4 w-4 mr-2" />
                      Charge to Room {room.room_number}
                    </DropdownMenuItem>
                  ))}
                  
                  {/* Table Charging Options */}
                  {tables.filter(t => t.status === 'occupied').map((table) => (
                    <DropdownMenuItem 
                      key={table.id} 
                      onClick={() => handleChargeToTable(table.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Charge to Table {table.table_number}
                    </DropdownMenuItem>
                  ))}
                  
                  {rooms.filter(r => r.status === 'occupied').length === 0 && 
                   tables.filter(t => t.status === 'occupied').length === 0 && (
                    <DropdownMenuItem disabled>
                      No occupied rooms or tables available
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleSettle}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Settle Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancel}
              >
                <span className="text-xs">CANCEL</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("CASH")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Banknote className="h-4 w-4" />
                <span className="text-xs">CASH</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("MOBILE_MONEY")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">MOBILE</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePayment("PAYSTACK")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">PAYSTACK</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Categories & Items */}
      <div className="flex-1 flex flex-col">
        {/* Categories */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="grid grid-cols-5 gap-2 flex-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className={`h-16 text-white font-bold text-xs ${category.color} ${
                    activeCategory === category.id ? "ring-2 ring-primary" : ""
                  } break-words hyphens-auto`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="leading-tight text-center px-1">
                    {category.name}
                  </span>
                </Button>
              ))}
            </div>
            <AdminPOSSettings />
          </div>
        </div>

        {/* Items Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className={`aspect-square h-28 w-full text-white font-bold text-xs ${item.color} hover:opacity-90 transition-opacity flex flex-col justify-center p-2 ${
                  item.isAvailable === false ? 'opacity-50' : ''
                }`}
                onClick={() => addItemToGuest(item)}
                disabled={item.isAvailable === false}
              >
                <div className="text-center space-y-1 w-full">
                  <div className="text-xs leading-tight break-words hyphens-auto px-1 whitespace-normal">
                    {item.name}
                  </div>
                  {item.price > 0 && (
                    <div className="text-xs opacity-90">{formatCurrency(item.price)}</div>
                  )}
                  {item.bookedDays && (
                    <div className="text-xs opacity-75 bg-black/20 px-1 py-0.5 rounded">
                      {item.bookedDays} days
                    </div>
                  )}
                  {item.isAvailable === false && (
                    <div className="text-xs opacity-75">UNAVAILABLE</div>
                  )}
                  {item.capacity && (
                    <div className="text-xs opacity-75">{item.capacity} seats</div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Service Name</label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter service name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                className="w-full mt-1 p-2 border border-border rounded-md bg-background"
              >
                <option value="accommodation">Accommodation</option>
                <option value="facilities">Facilities</option>
                <option value="amenities">Amenities</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addNewItem} className="bg-green-600 hover:bg-green-700">
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Service Name</label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter service name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                className="w-full mt-1 p-2 border border-border rounded-md bg-background"
              >
                <option value="accommodation">Accommodation</option>
                <option value="facilities">Facilities</option>
                <option value="amenities">Amenities</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addNewItem} className="bg-green-600 hover:bg-green-700">
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {paymentState.processing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p>Processing {paymentState.method} payment...</p>
              </>
            ) : paymentState.completed ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-green-600 font-semibold">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">
                  ${currentGuest ? (getGuestTotal(currentGuest) + getTotalTax(getGuestTotal(currentGuest))).toFixed(2) : '0.00'} paid via {paymentState.method}
                </p>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest Selection Dialog */}
      <Dialog open={showGuestSelection} onOpenChange={setShowGuestSelection}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Registered Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {getAvailableGuests().map((guest) => (
                <Button
                  key={guest.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => {
                    const newPosGuest: POSGuest = {
                      id: `pos-${Date.now()}`,
                      name: guest.name,
                      registeredGuestId: guest.id,
                      table: `Guest ${posGuests.length + 1}`,
                      items: []
                    };
                    setPosGuests(prev => [...prev, newPosGuest]);
                    setSelectedGuest(newPosGuest.id);
                    setShowGuestSelection(false);
                    toast({
                      title: "Guest Added",
                      description: `${guest.name} has been added to POS system`,
                    });
                  }}
                >
                  <div className="flex flex-col items-start space-y-2 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{guest.name}</span>
                      <Badge variant={guest.loyaltyTier === 'Platinum' ? 'default' : 'secondary'}>
                        {guest.loyaltyTier}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground text-left">
                      <div>{guest.email}</div>
                      <div>{guest.phone}</div>
                      <div className="text-xs">Last Stay: {guest.lastStay}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGuestSelection(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Walk-in Guest Form Dialog */}
      <Dialog open={showWalkInForm} onOpenChange={setShowWalkInForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Walk-in Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={walkInGuest.name}
                onChange={(e) => setWalkInGuest(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter guest name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone (Optional)</label>
              <Input
                value={walkInGuest.phone}
                onChange={(e) => setWalkInGuest(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email (Optional)</label>
              <Input
                type="email"
                value={walkInGuest.email}
                onChange={(e) => setWalkInGuest(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalkInForm(false)}>
              Cancel
            </Button>
            <Button onClick={addWalkInGuest} className="bg-primary hover:bg-primary/90">
              Add Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSSystem;