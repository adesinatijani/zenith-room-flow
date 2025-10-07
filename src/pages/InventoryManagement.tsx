import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import AddInventoryItemModal from "@/components/inventory/AddInventoryItemModal";
import EditInventoryItemModal from "@/components/inventory/EditInventoryItemModal";
import IssueInventoryModal from "@/components/inventory/IssueInventoryModal";
import RestockModal from "@/components/inventory/RestockModal";
import InventoryTemplateModal from "@/components/inventory/InventoryTemplateModal";
import POSConnectionModal from "@/components/inventory/POSConnectionModal";
import InventoryReportModal from "@/components/inventory/InventoryReportModal";
import SupplierIntegrationModal from "@/components/inventory/SupplierIntegrationModal";
import LowStockNotificationSystem from "@/components/inventory/LowStockNotificationSystem";
import InventoryActionButtons from "@/components/inventory/InventoryActionButtons";
import InventoryAnalyticsDashboard from "@/components/inventory/InventoryAnalyticsDashboard";
import {
  Package,
  Search,
  Plus,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  Users,
  Utensils,
  ClipboardList,
  BarChart3,
  Download,
  Upload,
  FileText,
  Settings,
  Edit,
  Package2,
  Truck,
  CheckCircle,
  XCircle
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: 'food' | 'beverages' | 'housekeeping' | 'maintenance' | 'office';
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  location: string;
}

interface IssuanceRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  department: 'kitchen' | 'housekeeping' | 'maintenance' | 'frontdesk';
  requestedBy: string;
  issuedAt: string;
  purpose: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface POSConnection {
  itemId: string;
  menuItemId: string;
  quantityUsed: number;
  lastSync: string;
}

const InventoryManagement = () => {
  const { toast } = useToast();
  const { formatCurrency } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole] = useState<'admin' | 'storekeeper' | 'manager' | 'staff'>('admin');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Initialize with mock data and fetch from Supabase
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map Supabase data to component format
      const mappedData = data?.map(item => ({
        id: item.id,
        name: item.item_name,
        category: item.category as 'food' | 'beverages' | 'housekeeping' | 'maintenance' | 'office',
        currentStock: item.current_quantity,
        minimumStock: item.min_threshold,
        unit: item.unit,
        unitPrice: item.cost_per_unit,
        supplier: item.supplier || "Unknown",
        lastRestocked: item.last_restocked || item.created_at,
        location: "Main Storage" // Default location
      })) || [];

      setInventory(mappedData);

      // Fallback to mock data if no items found
      if (mappedData.length === 0) {
        setInventory([
          {
            id: "INV001",
            name: "Premium Coffee Beans",
            category: 'food',
            currentStock: 45,
            minimumStock: 20,
            unit: 'kg',
            unitPrice: 25.50,
            supplier: "Coffee Masters Ltd",
            lastRestocked: "2024-01-10",
            location: "Dry Storage A"
          },
          {
            id: "INV002",
            name: "Fresh Towels",
            category: 'housekeeping',
            currentStock: 12,
            minimumStock: 25,
            unit: 'pieces',
            unitPrice: 15.00,
            supplier: "Linen Supply Co",
            lastRestocked: "2024-01-08",
            location: "Housekeeping Store"
          },
          {
            id: "INV003",
            name: "Toilet Paper",
            category: 'housekeeping',
            currentStock: 8,
            minimumStock: 20,
            unit: 'rolls',
            unitPrice: 2.50,
            supplier: "Hygiene Solutions",
            lastRestocked: "2024-01-05",
            location: "Housekeeping Store B"
          },
          {
            id: "INV004",
            name: "Red Wine",
            category: 'beverages',
            currentStock: 48,
            minimumStock: 24,
            unit: 'bottles',
            unitPrice: 35.00,
            supplier: "Fine Wine Imports",
            lastRestocked: "2024-01-12",
            expiryDate: "2026-12-31",
            location: "Bar Storage"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive"
      });
      
      // Set mock data as fallback
      setInventory([
        {
          id: "INV001",
          name: "Premium Coffee Beans",
          category: 'food',
          currentStock: 45,
          minimumStock: 20,
          unit: 'kg',
          unitPrice: 25.50,
          supplier: "Coffee Masters Ltd",
          lastRestocked: "2024-01-10",
          location: "Dry Storage A"
        },
        {
          id: "INV002",
          name: "Fresh Towels",
          category: 'housekeeping',
          currentStock: 12,
          minimumStock: 25,
          unit: 'pieces',
          unitPrice: 15.00,
          supplier: "Linen Supply Co",
          lastRestocked: "2024-01-08",
          location: "Housekeeping Store"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async (items: any[]) => {
    setIsLoading(true);
    try {
      console.log('Importing items:', items);
      
      // Insert items into Supabase
      const { data, error } = await supabase
        .from('inventory')
        .insert(items)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Successfully inserted:', data);

      toast({
        title: "Items Imported Successfully",
        description: `${items.length} inventory items have been added to your inventory.`,
      });

      fetchInventory(); // Refresh the list
      setShowTemplateModal(false); // Close the modal
    } catch (error: any) {
      console.error('Import error details:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import items. Please check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [issuances] = useState<IssuanceRecord[]>([
    {
      id: "ISS001",
      itemId: "INV001",
      itemName: "Premium Coffee Beans",
      quantity: 5,
      department: 'kitchen',
      requestedBy: "Chef Martinez",
      issuedAt: "2024-01-15 08:30",
      purpose: "Morning coffee service",
      status: 'approved'
    },
    {
      id: "ISS002",
      itemId: "INV002", 
      itemName: "Fresh Towels",
      quantity: 25,
      department: 'housekeeping',
      requestedBy: "Maria Santos",
      issuedAt: "2024-01-15 09:15",
      purpose: "Daily room service",
      status: 'approved'
    },
    {
      id: "ISS003",
      itemId: "INV003",
      itemName: "Toilet Paper",
      quantity: 10,
      department: 'housekeeping',
      requestedBy: "James Wilson",
      issuedAt: "2024-01-15 10:00",
      purpose: "Restocking guest rooms",
      status: 'pending'
    }
  ]);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      food: 'bg-green-500 text-white',
      beverages: 'bg-blue-500 text-white',
      housekeeping: 'bg-purple-500 text-white',
      maintenance: 'bg-orange-500 text-white',
      office: 'bg-gray-500 text-white'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { status: 'out-of-stock', color: 'bg-destructive text-destructive-foreground', label: 'Out of Stock' };
    if (current <= minimum) return { status: 'low-stock', color: 'bg-warning text-warning-foreground', label: 'Low Stock' };
    if (current <= minimum * 1.5) return { status: 'reorder', color: 'bg-orange-500 text-white', label: 'Reorder Soon' };
    return { status: 'in-stock', color: 'bg-success text-success-foreground', label: 'In Stock' };
  };

  const getDepartmentIcon = (dept: string) => {
    const icons = {
      kitchen: Utensils,
      housekeeping: Users,
      maintenance: Package,
      frontdesk: ClipboardList
    };
    return icons[dept as keyof typeof icons] || Package;
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleIssueItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowIssueModal(true);
  };

  const handleRestockItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowRestockModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels and manage supply chain operations</p>
        </div>
        <InventoryActionButtons
          userRole={userRole}
          onAddItem={() => setShowAddModal(true)}
          onShowTemplate={() => setShowTemplateModal(true)}
          onShowReports={() => setShowReportModal(true)}
          onShowPOSIntegration={() => setShowPOSModal(true)}
          onShowSupplierIntegration={() => setShowSupplierModal(true)}
        />
      </div>

      {/* Low Stock Notification System */}
      <LowStockNotificationSystem
        userRole={userRole}
        onRestockRequest={(itemId) => {
          const item = inventory.find(i => i.id === itemId);
          if (item) {
            setSelectedItem(item);
            setShowRestockModal(true);
          }
        }}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="issuances">Issuances</TabsTrigger>
          <TabsTrigger value="pos-sync">POS Integration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item.currentStock, item.minimumStock);
              
              return (
                <Card key={item.id} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.name}</h3>
                          <p className="text-muted-foreground">ID: {item.id} • {item.supplier}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.toUpperCase()}
                        </Badge>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Stock Information</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Stock</span>
                            <span className="font-bold">{item.currentStock} {item.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Minimum Stock</span>
                            <span>{item.minimumStock} {item.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unit Price</span>
                            <span>{formatCurrency(item.unitPrice)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Location & Dates</h4>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <p className="font-medium">{item.location}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Last Restocked:</span>
                            <p className="font-medium">{item.lastRestocked}</p>
                          </div>
                          {item.expiryDate && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Expires:</span>
                              <p className="font-medium">{item.expiryDate}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Value & Analytics</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Value</span>
                            <span className="font-bold">{formatCurrency(item.currentStock * item.unitPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days Until Reorder</span>
                            <span>{Math.ceil((item.currentStock - item.minimumStock) / (item.minimumStock * 0.1)) || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Actions</h4>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => handleIssueItem(item)}
                            className="w-full button-luxury"
                            size="sm"
                          >
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Issue
                          </Button>
                          <Button 
                            onClick={() => handleRestockItem(item)}
                            variant="outline" 
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Restock
                          </Button>
                          <Button 
                            onClick={() => handleEditItem(item)}
                            variant="ghost" 
                            className="w-full"
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Issuances Tab */}
        <TabsContent value="issuances" className="space-y-6">
          <div className="grid gap-4">
            {issuances.map((issuance) => {
              const DeptIcon = getDepartmentIcon(issuance.department);
              return (
                <Card key={issuance.id} className="card-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                          <DeptIcon className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{issuance.itemName}</h3>
                          <p className="text-muted-foreground">
                            {issuance.quantity} units • {issuance.department} • {issuance.requestedBy}
                          </p>
                          <p className="text-sm text-muted-foreground">{issuance.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={issuance.status === 'approved' ? 'default' : 
                                  issuance.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {issuance.status.toUpperCase()}
                        </Badge>
                        {issuance.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="h-8">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-8">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* POS Integration Tab */}
        <TabsContent value="pos-sync" className="space-y-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>POS Integration Status</CardTitle>
              <CardDescription>
                Monitor inventory connections with Point of Sale system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package2 className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Restaurant POS</h3>
                      <p className="text-sm text-muted-foreground">Connected • Last sync: 5 minutes ago</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recent Deductions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Coffee Beans</span>
                        <span>-2 kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fresh Towels</span>
                        <span>-5 pieces</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Red Wine</span>
                        <span>-3 bottles</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Connected Items</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Connections</span>
                        <span>12 items</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Auto-sync Enabled</span>
                        <span>8 items</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Manual Override</span>
                        <span>4 items</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowPOSModal(true)}
                  className="button-luxury"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Configure POS Connections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <InventoryAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* All Modal Components */}
      <AddInventoryItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onItemAdded={fetchInventory}
      />

      <EditInventoryItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={selectedItem}
        onItemUpdated={fetchInventory}
      />

      <IssueInventoryModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        item={selectedItem}
        onItemIssued={fetchInventory}
      />

      <RestockModal
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        item={selectedItem}
        onItemRestocked={fetchInventory}
      />

      <InventoryTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onImportData={handleImportData}
      />

      <POSConnectionModal
        isOpen={showPOSModal}
        onClose={() => setShowPOSModal(false)}
      />

      <InventoryReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        inventoryData={inventory}
      />

      <SupplierIntegrationModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        mode="inventory"
      />
    </div>
  );
};

export default InventoryManagement;