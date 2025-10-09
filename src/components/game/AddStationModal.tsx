import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGameCenterDB } from "@/hooks/useGameCenterDB";

interface AddStationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStationModal = ({ open, onOpenChange }: AddStationModalProps) => {
  const { toast } = useToast();
  const { addStation } = useGameCenterDB();
  
  const [stationData, setStationData] = useState({
    stationName: "",
    stationNumber: "",
    gameType: "",
    hourlyRate: "",
    location: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setStationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!stationData.stationName || !stationData.stationNumber || !stationData.gameType || !stationData.hourlyRate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addStation({
        station_name: stationData.stationName,
        station_number: stationData.stationNumber,
        game_type: stationData.gameType,
        hourly_rate: parseFloat(stationData.hourlyRate),
        status: "available",
        location: stationData.location || "Main Gaming Area"
      });

      toast({
        title: "Station Added Successfully",
        description: `${stationData.stationName} has been added to the gaming center`,
      });

      // Reset form
      setStationData({
        stationName: "",
        stationNumber: "",
        gameType: "",
        hourlyRate: "",
        location: ""
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add station",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Add New Gaming Station
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="stationName">Station Name *</Label>
            <Input
              id="stationName"
              value={stationData.stationName}
              onChange={(e) => handleInputChange("stationName", e.target.value)}
              placeholder="e.g., Gaming PC #1, PS5 Station #2"
            />
          </div>

          <div>
            <Label htmlFor="stationNumber">Station Number *</Label>
            <Input
              id="stationNumber"
              value={stationData.stationNumber}
              onChange={(e) => handleInputChange("stationNumber", e.target.value)}
              placeholder="e.g., G-001, PS5-01"
            />
          </div>

          <div>
            <Label htmlFor="gameType">Game Type *</Label>
            <Select value={stationData.gameType} onValueChange={(value) => handleInputChange("gameType", value)}>
              <SelectTrigger id="gameType">
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PC Gaming">PC Gaming</SelectItem>
                <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
                <SelectItem value="Xbox Series X">Xbox Series X</SelectItem>
                <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
                <SelectItem value="VR Gaming">VR Gaming</SelectItem>
                <SelectItem value="Racing Simulator">Racing Simulator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              value={stationData.hourlyRate}
              onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
              placeholder="e.g., 25.00"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={stationData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Main Gaming Area, VIP Room"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Gamepad2 className="h-4 w-4 mr-2" />
            Add Station
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationModal;
