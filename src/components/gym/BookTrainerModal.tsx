import { useState } from "react";
import { Calendar, Clock, User, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useToast } from "@/hooks/use-toast";

interface Trainer {
  id: string;
  name: string;
  specialization: string[];
  hourlyRate: number;
  availability: string;
  rating: number;
  image?: string;
}

interface BookTrainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrainer?: Trainer;
}

const BookTrainerModal = ({ open, onOpenChange, selectedTrainer }: BookTrainerModalProps) => {
  const { toast } = useToast();
  const { formatCurrency } = useGlobalSettings();
  
  const [bookingData, setBookingData] = useState({
    trainerId: selectedTrainer?.id || "",
    memberName: "",
    memberPhone: "",
    date: "",
    time: "",
    duration: "60",
    sessionType: "",
    notes: ""
  });

  const trainers: Trainer[] = [
    {
      id: "1",
      name: "Alex Rodriguez",
      specialization: ["Weight Training", "HIIT"],
      hourlyRate: 80,
      availability: "available",
      rating: 4.9
    },
    {
      id: "2",
      name: "Emma Davis",
      specialization: ["Yoga", "Pilates"],
      hourlyRate: 70,
      availability: "available",
      rating: 4.8
    },
    {
      id: "3",
      name: "Chris Brown",
      specialization: ["CrossFit", "Cardio"],
      hourlyRate: 75,
      availability: "available",
      rating: 4.7
    }
  ];

  const availableSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const sessionTypes = [
    "Personal Training",
    "Group Session",
    "Fitness Assessment",
    "Nutrition Consultation",
    "Specialized Training"
  ];

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!bookingData.trainerId || !bookingData.memberName || !bookingData.date || !bookingData.time || !bookingData.sessionType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const trainer = trainers.find(t => t.id === bookingData.trainerId);
    const totalCost = trainer ? (trainer.hourlyRate * parseInt(bookingData.duration)) / 60 : 0;

    toast({
      title: "Session Booked Successfully",
      description: `Training session with ${trainer?.name} booked for ${bookingData.date} at ${bookingData.time}. Total cost: ${formatCurrency(totalCost)}`,
    });

    // Reset form
    setBookingData({
      trainerId: "",
      memberName: "",
      memberPhone: "",
      date: "",
      time: "",
      duration: "60",
      sessionType: "",
      notes: ""
    });

    onOpenChange(false);
  };

  const selectedTrainerData = trainers.find(t => t.id === bookingData.trainerId);
  const totalCost = selectedTrainerData ? (selectedTrainerData.hourlyRate * parseInt(bookingData.duration)) / 60 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Book Trainer Session
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trainer Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Trainer</h3>
            
            <div className="space-y-3">
              {trainers.filter(t => t.availability === "available").map((trainer) => (
                <Card 
                  key={trainer.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    bookingData.trainerId === trainer.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleInputChange("trainerId", trainer.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{trainer.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-sm text-muted-foreground">{trainer.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(trainer.hourlyRate)}/hr</div>
                        <Badge variant="secondary" className="text-xs">Available</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specialization.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Booking Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="memberName">Member Name *</Label>
                <Input
                  id="memberName"
                  value={bookingData.memberName}
                  onChange={(e) => handleInputChange("memberName", e.target.value)}
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <Label htmlFor="memberPhone">Contact Phone</Label>
                <Input
                  id="memberPhone"
                  value={bookingData.memberPhone}
                  onChange={(e) => handleInputChange("memberPhone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Select value={bookingData.time} onValueChange={(value) => handleInputChange("time", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={bookingData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sessionType">Session Type *</Label>
                <Select value={bookingData.sessionType} onValueChange={(value) => handleInputChange("sessionType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Special Notes</Label>
                <Input
                  id="notes"
                  value={bookingData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any special requirements or notes"
                />
              </div>
            </div>

            {/* Cost Summary */}
            {selectedTrainerData && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Trainer:</span>
                    <span className="font-semibold">{selectedTrainerData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{bookingData.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>{formatCurrency(selectedTrainerData.hourlyRate)}/hour</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(totalCost)}</span>
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
            <Clock className="h-4 w-4 mr-2" />
            Book Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookTrainerModal;