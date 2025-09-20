import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

interface Room {
  id: string;
  number: string;
  type: string;
  status: "ready" | "occupied" | "vacant-dirty" | "under-repairs";
  rate: number;
  floor: number;
  bedType: string;
  roomSize: number;
  amenities: string[];
  guest?: string;
  checkIn?: string;
  checkOut?: string;
}

interface RoomSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onRoomUpdate: (room: Room) => void;
}

export const RoomSettingsModal = ({ open, onOpenChange, room, onRoomUpdate }: RoomSettingsModalProps) => {
  const [status, setStatus] = useState<Room["status"]>("ready");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false);
  const [isPriorityClean, setIsPriorityClean] = useState(false);

  useEffect(() => {
    if (room) {
      setStatus(room.status);
      setMaintenanceNotes("");
      setIsDoNotDisturb(false);
      setIsPriorityClean(false);
    }
  }, [room]);

  const handleSave = () => {
    if (!room) return;

    const updatedRoom = {
      ...room,
      status
    };

    onRoomUpdate(updatedRoom);
    
    if (maintenanceNotes) {
      toast.success(`Room ${room.number} settings updated with maintenance notes`);
    } else {
      toast.success(`Room ${room.number} status updated to ${status}`);
    }
    
    onOpenChange(false);
  };

  if (!room) return null;

  const { formatCurrency } = useGlobalSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Room {room.number} Settings</DialogTitle>
          <DialogDescription>Manage room status and maintenance settings</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="status">Room Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Room["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant-dirty">Vacant Dirty</SelectItem>
                <SelectItem value="under-repairs">Under Repairs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dnd">Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">Prevent housekeeping interruptions</p>
            </div>
            <Switch
              id="dnd"
              checked={isDoNotDisturb}
              onCheckedChange={setIsDoNotDisturb}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="priority">Priority Cleaning</Label>
              <p className="text-sm text-muted-foreground">Mark for immediate attention</p>
            </div>
            <Switch
              id="priority"
              checked={isPriorityClean}
              onCheckedChange={setIsPriorityClean}
            />
          </div>

          <div>
            <Label htmlFor="notes">Maintenance Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any maintenance or special instructions..."
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium mb-2">Room Information</h4>
            <div className="text-sm space-y-1">
              <p>Type: {room.type}</p>
              <p>Floor: {room.floor}</p>
              <p>Rate: {formatCurrency(room.rate)}/night</p>
              {room.guest && <p>Current Guest: {room.guest}</p>}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};