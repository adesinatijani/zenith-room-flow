import { useState } from "react";
import { User, Mail, Phone, Calendar, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGuestsDB } from "@/hooks/useGuestsDB";
import { useGymDB } from "@/hooks/useGymDB";
import AddGuestModal from "@/components/guest/AddGuestModal";

interface NewMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewMemberModal = ({ open, onOpenChange }: NewMemberModalProps) => {
  const { toast } = useToast();
  const { guests } = useGuestsDB();
  const { addMember } = useGymDB();
  
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [memberData, setMemberData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    membershipType: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalConditions: "",
    paymentMethod: ""
  });

  const membershipPlans = [
    {
      id: "day-pass",
      name: "Day Pass",
      price: 25,
      duration: "1 Day",
      features: ["Full gym access", "Locker room", "Basic equipment"],
      color: "bg-blue-500"
    },
    {
      id: "monthly",
      name: "Monthly Membership",
      price: 89,
      duration: "30 Days",
      features: ["Full gym access", "Locker room", "All equipment", "Group classes"],
      color: "bg-green-500"
    },
    {
      id: "yearly",
      name: "Yearly Membership",
      price: 899,
      duration: "365 Days",
      features: ["Full gym access", "Locker room", "All equipment", "Group classes", "Personal trainer consultation", "Guest passes"],
      color: "bg-purple-500"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setMemberData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestSelect = (guestId: string) => {
    if (guestId === "add_new") {
      setShowAddGuestModal(true);
      return;
    }
    
    setSelectedGuestId(guestId);
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      setMemberData(prev => ({
        ...prev,
        firstName: guest.name.split(' ')[0] || "",
        lastName: guest.name.split(' ').slice(1).join(' ') || "",
        email: guest.email || "",
        phone: guest.phone || ""
      }));
    }
  };

  const handleSubmit = async () => {
    if (!memberData.firstName || !memberData.lastName || !memberData.email || !memberData.phone || !memberData.membershipType || !selectedPlan) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      // Calculate end date based on membership type
      if (memberData.membershipType === "day-pass") {
        endDate.setDate(endDate.getDate() + 1);
      } else if (memberData.membershipType === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (memberData.membershipType === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      await addMember({
        name: `${memberData.firstName} ${memberData.lastName}`,
        email: memberData.email,
        phone: memberData.phone,
        membership_type: memberData.membershipType as "day-pass" | "monthly" | "yearly",
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: "active"
      });

      toast({
        title: "Member Added Successfully",
        description: `${memberData.firstName} ${memberData.lastName} has been registered as a new member`,
      });

      // Reset form
      setSelectedGuestId("");
      setMemberData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        membershipType: "",
        emergencyContact: "",
        emergencyPhone: "",
        medicalConditions: "",
        paymentMethod: ""
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    }
  };

  const selectedPlan = membershipPlans.find(plan => plan.id === memberData.membershipType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Add New Member
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div>
              <Label htmlFor="guest">Select Existing Guest (Optional)</Label>
              <Select value={selectedGuestId} onValueChange={handleGuestSelect}>
                <SelectTrigger id="guest">
                  <SelectValue placeholder="Select a guest or add new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_new">+ Add New Guest</SelectItem>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.name} - {guest.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={memberData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={memberData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={memberData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={memberData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  className="pl-10"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6">Emergency Contact</h3>
            
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
              <Input
                id="emergencyContact"
                value={memberData.emergencyContact}
                onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div>
              <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyPhone"
                value={memberData.emergencyPhone}
                onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                placeholder="Enter emergency contact phone"
              />
            </div>

            <div>
              <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
              <Input
                id="medicalConditions"
                value={memberData.medicalConditions}
                onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                placeholder="Any medical conditions or allergies"
              />
            </div>
          </div>

          {/* Membership Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Membership Plan *</h3>
            
            <div className="space-y-3">
              {membershipPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    memberData.membershipType === plan.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleInputChange("membershipType", plan.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className={`${plan.color} text-white`}>
                          {plan.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{plan.duration}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${plan.price}</div>
                      </div>
                    </div>
                    <ul className="text-sm space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-1 w-1 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPlan && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Plan:</span>
                      <span className="font-semibold">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Duration:</span>
                      <span>{selectedPlan.duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>${selectedPlan.price}</span>
                    </div>
                    
                    <Select value={memberData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <CreditCard className="h-4 w-4 mr-2" />
            Register Member
          </Button>
        </DialogFooter>
      </DialogContent>
      
      <AddGuestModal
        open={showAddGuestModal}
        onOpenChange={setShowAddGuestModal}
      />
    </Dialog>
  );
};

export default NewMemberModal;