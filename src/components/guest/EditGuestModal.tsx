import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { Edit, X } from "lucide-react";

interface EditGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId: string;
  guestName: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  loyalty_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'vip' | 'blacklisted';
  preferences: string[];
  notes: string;
}

const EditGuestModal = ({ open, onOpenChange, guestId, guestName }: EditGuestModalProps) => {
  const { toast } = useToast();
  const { getGuestById, updateGuest } = useGuestsDB();
  const [formData, setFormData] = useState<Guest>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    nationality: "",
    loyalty_tier: 'Bronze',
    status: 'active',
    preferences: [],
    notes: ""
  });
  const [newPreference, setNewPreference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && guestId) {
      const guest = getGuestById(guestId);
      if (guest) {
        setFormData({
          id: guest.id,
          name: guest.name,
          email: guest.email || "",
          phone: guest.phone || "",
          address: guest.address || "",
          nationality: guest.nationality || "",
          loyalty_tier: guest.loyalty_tier,
          status: guest.status,
          preferences: guest.preferences || [],
          notes: guest.notes || ""
        });
      }
    }
  }, [open, guestId, getGuestById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateGuest(guestId, {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        nationality: formData.nationality || undefined,
        loyalty_tier: formData.loyalty_tier,
        status: formData.status,
        preferences: formData.preferences,
        notes: formData.notes || undefined
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update guest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Guest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPreference = () => {
    if (newPreference.trim() && !formData.preferences.includes(newPreference.trim())) {
      setFormData(prev => ({
        ...prev,
        preferences: [...prev.preferences, newPreference.trim()]
      }));
      setNewPreference("");
    }
  };

  const removePreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.filter(p => p !== preference)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Guest Profile
          </DialogTitle>
          <DialogDescription>
            Update guest information and preferences
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nationality">Nationality</Label>
              <Input
                id="edit-nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-loyalty">Loyalty Tier</Label>
              <Select value={formData.loyalty_tier} onValueChange={(value) => handleInputChange("loyalty_tier", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preferences</Label>
            <div className="flex gap-2">
              <Input
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                placeholder="Add new preference"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreference())}
              />
              <Button type="button" onClick={addPreference} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferences.map((pref, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {pref}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removePreference(pref)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Additional Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="button-luxury" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGuestModal;