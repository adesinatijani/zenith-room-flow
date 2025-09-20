import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

interface Room {
  id: string;
  number: string;
  type: string;
  status: string;
  rate: number;
  floor: number;
  bedType: string;
  roomSize: number;
  amenities: string[];
  guest?: string;
  checkIn?: string;
  checkOut?: string;
}

interface EditRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onRoomUpdate: (room: Room) => void;
}

const roomTypes = [
  "Standard Single", "Standard Double", "King Size", "Queen Size", "Twin Beds",
  "Suite", "Deluxe Single", "Deluxe Double", "Presidential Suite", "Executive Room"
];

const availableAmenities = [
  "WiFi", "Air Condition", "Television", "Reading Table & Chair", 
  "Fan", "Solar Power", "Mini Bar", "Balcony", "Kitchen", 
  "Living Room", "Work Desk", "Coffee Machine", "Mini Fridge", "Kitchenette"
];

export const EditRoomModal = ({ open, onOpenChange, room, onRoomUpdate }: EditRoomModalProps) => {
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

  useEffect(() => {
    if (room) {
      setFormData({
        number: room.number,
        type: room.type,
        rate: room.rate.toString(),
        floor: room.floor.toString(),
        bedType: room.bedType,
        roomSize: room.roomSize.toString(),
        amenities: room.amenities
      });
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room) return;

    const updatedRoom = {
      ...room,
      number: formData.number,
      type: formData.type as any,
      rate: parseFloat(formData.rate),
      floor: parseInt(formData.floor),
      bedType: formData.bedType,
      roomSize: parseFloat(formData.roomSize),
      amenities: formData.amenities
    };

    onRoomUpdate(updatedRoom);
    toast.success("Room updated successfully");
    onOpenChange(false);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Room {room.number}</DialogTitle>
          <DialogDescription>Update room information and amenities</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">Room Number</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({...prev, number: e.target.value}))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Room Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({...prev, type: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rate">Rate per Night ({settings.currency})</Label>
              <Input
                id="rate"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({...prev, rate: e.target.value}))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Select value={formData.floor} onValueChange={(value) => setFormData(prev => ({...prev, floor: value}))}>
                <SelectTrigger>
                  <SelectValue />
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
              />
            </div>
            
            <div>
              <Label htmlFor="roomSize">Room Size (m²)</Label>
              <Input
                id="roomSize"
                type="number"
                value={formData.roomSize}
                onChange={(e) => setFormData(prev => ({...prev, roomSize: e.target.value}))}
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
            <Button type="submit">Update Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};