import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { RoomCalendarModal } from "./RoomCalendarModal";
import { Calendar, Trash2, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  onRoomDelete?: (roomId: string) => void;
}

export const RoomSettingsModal = ({ open, onOpenChange, room, onRoomUpdate, onRoomDelete }: RoomSettingsModalProps) => {
  const [status, setStatus] = useState<Room["status"]>("ready");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false);
  const [isPriorityClean, setIsPriorityClean] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { isAdmin } = useAuth();

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

  const handleDelete = () => {
    if (!room || !onRoomDelete) return;
    
    onRoomDelete(room.id);
    toast.success(`Room ${room.number} deleted successfully`);
    setShowDeleteAlert(false);
    onOpenChange(false);
  };

  if (!room) return null;

  const { formatCurrency } = useGlobalSettings();

  return (
    <>
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
        
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCalendar(true)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                View Calendar
              </Button>
              
              {isAdmin && onRoomDelete && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteAlert(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Room
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RoomCalendarModal 
        open={showCalendar}
        onOpenChange={setShowCalendar}
        room={room}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Room {room?.number}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};