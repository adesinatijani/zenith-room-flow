import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurantTables } from "@/hooks/useRestaurantTables";
import { toast } from "@/hooks/use-toast";

interface TableManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableManagementModal({ open, onOpenChange }: TableManagementModalProps) {
  const { tables, loading, addTable, updateTableStatus } = useRestaurantTables();
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableSeats, setNewTableSeats] = useState("4");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTable = async () => {
    if (!newTableNumber.trim()) {
      toast({
        title: "Error",
        description: "Table number is required",
        variant: "destructive",
      });
      return;
    }

    // Check if table number already exists
    const existingTable = tables.find(t => t.table_number === newTableNumber.trim());
    if (existingTable) {
      toast({
        title: "Error",
        description: "Table number already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTable(newTableNumber.trim(), parseInt(newTableSeats));
      setNewTableNumber("");
      setNewTableSeats("4");
      setShowAddForm(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600';
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cleaning':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      case 'cleaning':
        return 'Cleaning';
      default:
        return 'Unknown';
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: any) => {
    try {
      await updateTableStatus(tableId, newStatus);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Table Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Restaurant Tables</h3>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </div>

          {showAddForm && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      value={newTableNumber}
                      onChange={(e) => setNewTableNumber(e.target.value)}
                      placeholder="e.g., T1, Table 01"
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor="tableSeats">Seats</Label>
                    <Input
                      id="tableSeats"
                      type="number"
                      min="1"
                      max="20"
                      value={newTableSeats}
                      onChange={(e) => setNewTableSeats(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddTable}>Add</Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-8">Loading tables...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <Card key={table.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Table {table.table_number}</h4>
                      <Badge className={`text-white ${getStatusColor(table.status)}`}>
                        {getStatusLabel(table.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {table.seats} seats
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={table.status === 'available' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(table.id, 'available')}
                      >
                        Available
                      </Button>
                      <Button 
                        size="sm" 
                        variant={table.status === 'occupied' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(table.id, 'occupied')}
                      >
                        Occupied
                      </Button>
                      <Button 
                        size="sm" 
                        variant={table.status === 'cleaning' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(table.id, 'cleaning')}
                      >
                        Cleaning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {tables.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No tables created yet. Click "Add Table" to get started.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}