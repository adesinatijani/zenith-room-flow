import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { UserPlus } from "lucide-react";

interface AddGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddGuestModal = ({ open, onOpenChange }: AddGuestModalProps) => {
  const { toast } = useToast();
  const { addGuest } = useGuestsDB();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    address: "",
    preferences: "",
    notes: "",
    status: "active" as const,
    loyalty_tier: "Bronze" as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert preferences string to array
      const preferencesArray = formData.preferences
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      await addGuest({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        nationality: formData.nationality || undefined,
        address: formData.address || undefined,
        preferences: preferencesArray,
        notes: formData.notes || undefined,
        status: formData.status,
        loyalty_tier: formData.loyalty_tier
      });
      
      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        nationality: "",
        address: "",
        preferences: "",
        notes: "",
        status: "active",
        loyalty_tier: "Bronze"
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add guest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Guest
          </DialogTitle>
          <DialogDescription>
            Register a new guest in the system
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                placeholder="USA"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferences">Preferences</Label>
            <Input
              id="preferences"
              value={formData.preferences}
              onChange={(e) => handleInputChange("preferences", e.target.value)}
              placeholder="Non-smoking, High floor, City view"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="button-luxury" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Guest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGuestModal;