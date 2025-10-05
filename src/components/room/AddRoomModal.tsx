import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomAdd: (room: any) => void;
}

const roomTypes = [
  "Standard Single",
  "Standard Double", 
  "King Size",
  "Queen Size",
  "Twin Beds",
  "Suite",
  "Deluxe Single",
  "Deluxe Double",
  "Presidential Suite",
  "Executive Room"
];

const availableAmenities = [
  "WiFi", "Air Condition", "Television", "Reading Table & Chair", 
  "Fan", "Solar Power", "Mini Bar", "Balcony", "Kitchen", 
  "Living Room", "Work Desk", "Coffee Machine", "Mini Fridge", "Kitchenette"
];

export const AddRoomModal = ({ open, onOpenChange, onRoomAdd }: AddRoomModalProps) => {
  const { settings } = useGlobalSettings();
  const [formData, setFormData] = useState({
    number: "",
    type: "",
    rate: "",
    floor: "",
    bedType: "",
    roomSize: "",
    amenities: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.type || !formData.rate || !formData.floor) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await onRoomAdd({
        room_number: formData.number,
        room_type: formData.type,
        rate: parseFloat(formData.rate),
        floor_number: parseInt(formData.floor),
        capacity: parseFloat(formData.roomSize) || 30,
        amenities: formData.amenities,
        description: formData.bedType || formData.type
      });
      
      onOpenChange(false);
      setFormData({
        number: "", type: "", rate: "", floor: "", bedType: "", roomSize: "", amenities: []
      });
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new room in the hotel</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">Room Number *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({...prev, number: e.target.value}))}
                placeholder="101"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Room Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({...prev, type: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rate">Rate per Night ({settings.currency}) *</Label>
              <Input
                id="rate"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({...prev, rate: e.target.value}))}
                placeholder="150"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="floor">Floor *</Label>
              <Select value={formData.floor} onValueChange={(value) => setFormData(prev => ({...prev, floor: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Floor 1</SelectItem>
                  <SelectItem value="2">Floor 2</SelectItem>
                  <SelectItem value="3">Floor 3</SelectItem>
                  <SelectItem value="4">Floor 4</SelectItem>
                  <SelectItem value="5">Floor 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bedType">Bed Type</Label>
              <Input
                id="bedType"
                value={formData.bedType}
                onChange={(e) => setFormData(prev => ({...prev, bedType: e.target.value}))}
                placeholder="King Size Bed"
              />
            </div>
            
            <div>
              <Label htmlFor="roomSize">Room Size (m²)</Label>
              <Input
                id="roomSize"
                type="number"
                value={formData.roomSize}
                onChange={(e) => setFormData(prev => ({...prev, roomSize: e.target.value}))}
                placeholder="35"
              />
            </div>
          </div>
          
          <div>
            <Label>Amenities</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {availableAmenities.map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};