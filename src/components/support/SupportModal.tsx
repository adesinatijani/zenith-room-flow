import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { HelpCircle, Mail, Phone, MessageCircle, Book } from "lucide-react";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupportModal = ({ open, onOpenChange }: SupportModalProps) => {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitTicket = async () => {
    if (!subject || !category || !message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Support ticket submitted successfully! We'll get back to you within 24 hours.");
      setSubject("");
      setCategory("");
      setMessage("");
      setLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support Center
          </DialogTitle>
          <DialogDescription>
            Get help with your hotel management system
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">User Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="training">Training/How-to</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={5}
              />
            </div>

            <div className="flex gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>support@hotelms.com</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTicket} disabled={loading}>
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">How do I add a new room?</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate to Room Management and click the "Add Room" button. Fill in the room details and save.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">How do I process a check-in?</h4>
                <p className="text-sm text-muted-foreground">
                  Go to the room card and click "Check In". Enter guest details and confirm the booking.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">How do I manage inventory?</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Inventory Management section to track stock levels, add items, and set reorder points.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">How do I generate reports?</h4>
                <p className="text-sm text-muted-foreground">
                  Visit the Reports section to generate financial, occupancy, and operational reports.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <Book className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Getting Started Guide</h4>
                  <p className="text-sm text-muted-foreground">Learn the basics of the hotel management system</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <Book className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Room Management</h4>
                  <p className="text-sm text-muted-foreground">Complete guide to managing rooms and reservations</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <Book className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">POS System Usage</h4>
                  <p className="text-sm text-muted-foreground">How to use the restaurant POS system</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <Book className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Staff Management</h4>
                  <p className="text-sm text-muted-foreground">Managing employees, payroll, and HR functions</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};