import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameStation } from "@/hooks/useGameCenterDB";

interface EditStationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: GameStation | null;
  onUpdate: (id: string, data: Partial<GameStation>) => Promise<void>;
}

const EditStationModal = ({ open, onOpenChange, station, onUpdate }: EditStationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    station_name: station?.station_name || "",
    game_type: station?.game_type || "console",
    hourly_rate: station?.hourly_rate || 0,
    status: station?.status || "available"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) return;

    setIsSubmitting(true);
    try {
      await onUpdate(station.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating station:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Game Station</DialogTitle>
          <DialogDescription>Update game station details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="station_name">Station Name</Label>
            <Input
              id="station_name"
              value={formData.station_name}
              onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Game Type</Label>
            <Select value={formData.game_type} onValueChange={(value: any) => setFormData({ ...formData, game_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="console">Console</SelectItem>
                <SelectItem value="pc">PC Gaming</SelectItem>
                <SelectItem value="vr">VR Station</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Station"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStationModal;
