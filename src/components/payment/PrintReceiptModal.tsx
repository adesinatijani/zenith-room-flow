import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

interface Payment {
  id: string;
  transactionId: string;
  guestName: string;
  amount: number;
  method: 'card' | 'cash' | 'bank' | 'paystack' | 'flutterwave';
  type: 'booking' | 'pos' | 'service' | 'refund';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  description: string;
  roomNumber?: string;
  reference: string;
}

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const PrintReceiptModal = ({ isOpen, onClose, payment }: PrintReceiptModalProps) => {
  const { toast } = useToast();
  const { settings, formatCurrency } = useGlobalSettings();

  if (!payment) return null;

  const getMethodBadge = (method: string) => {
    const colors = {
      card: 'bg-blue-500 text-white',
      cash: 'bg-green-500 text-white', 
      bank: 'bg-purple-500 text-white',
      paystack: 'bg-orange-500 text-white',
      flutterwave: 'bg-yellow-500 text-black'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getReceiptHTML());
      printWindow.document.close();
      printWindow.print();
      
      toast({
        title: "Receipt Sent to Printer",
        description: "Receipt is being printed",
      });
    }
  };

  const handleDownload = () => {
    const receiptHTML = getReceiptHTML();
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.transactionId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: "Receipt saved to your downloads folder",
    });
  };

  const handleEmail = () => {
    const subject = `Payment Receipt - ${payment.transactionId}`;
    const body = `Dear ${payment.guestName},\n\nThank you for your payment. Please find your receipt details below:\n\nTransaction ID: ${payment.transactionId}\nAmount: ${formatCurrency(Math.abs(payment.amount))}\nDate: ${payment.date}\nDescription: ${payment.description}\n\nBest regards,\nYour Hotel Team`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Email Client Opened",
      description: "Receipt details prepared for email",
    });
  };

  const getReceiptHTML = () => {
    const tax = Math.abs(payment.amount) * (settings.tax_rate || 7.5) / 100;
    const subtotal = Math.abs(payment.amount) - tax;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; line-height: 1.4; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .contact-info { font-size: 12px; color: #666; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; }
          .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 0.9em; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          .header-message { font-style: italic; color: #2563eb; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${settings.hotel_name}</div>
          <div class="header-message">Thank you for choosing us!</div>
          ${settings.hotel_address ? `<div class="contact-info">${settings.hotel_address}</div>` : ''}
          ${settings.hotel_phone ? `<div class="contact-info">📞 ${settings.hotel_phone}</div>` : ''}
          ${settings.hotel_email ? `<div class="contact-info">✉️ ${settings.hotel_email}</div>` : ''}
        </div>
        
        <div class="row">
          <span>Transaction ID:</span>
          <span>${payment.transactionId}</span>
        </div>
        <div class="row">
          <span>Guest Name:</span>
          <span>${payment.guestName}</span>
        </div>
        <div class="row">
          <span>Date & Time:</span>
          <span>${payment.date}</span>
        </div>
        <div class="row">
          <span>Payment Method:</span>
          <span>${payment.method.toUpperCase()}</span>
        </div>
        <div class="row">
          <span>Transaction Type:</span>
          <span>${payment.type.toUpperCase()}</span>
        </div>
        ${payment.roomNumber ? `<div class="row"><span>Room Number:</span><span>${payment.roomNumber}</span></div>` : ''}
        <div class="row">
          <span>Description:</span>
          <span>${payment.description}</span>
        </div>
        <div class="row">
          <span>Reference:</span>
          <span>${payment.reference}</span>
        </div>
        
        <div class="row">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div class="row">
          <span>Tax (${settings.tax_rate || 7.5}%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        <div class="row total">
          <span>Total Amount:</span>
          <span>${payment.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(payment.amount))}</span>
        </div>
        
        <div class="footer">
          <p>We appreciate your business. Have a wonderful day!</p>
          <p>This is a computer-generated receipt.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Print Receipt</DialogTitle>
          <DialogDescription>
            Print or download receipt for transaction {payment.transactionId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center border-b-2 border-border pb-4 mb-4">
                <h2 className="text-xl font-bold">{settings.hotel_name}</h2>
                <p className="text-sm text-muted-foreground italic text-blue-600 mt-2">Thank you for choosing us!</p>
                {settings.hotel_address && (
                  <p className="text-xs text-muted-foreground">{settings.hotel_address}</p>
                )}
                <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-1">
                  {settings.hotel_phone && <span>📞 {settings.hotel_phone}</span>}
                  {settings.hotel_email && <span>✉️ {settings.hotel_email}</span>}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-medium">{payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest Name:</span>
                  <span className="font-medium">{payment.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">{payment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <Badge className={getMethodBadge(payment.method)} variant="outline">
                    {payment.method.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Type:</span>
                  <span className="font-medium capitalize">{payment.type}</span>
                </div>
                {payment.roomNumber && (
                  <div className="flex justify-between">
                    <span>Room Number:</span>
                    <span className="font-medium">{payment.roomNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Description:</span>
                  <span className="font-medium text-right max-w-[200px] break-words">{payment.description}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium">{payment.reference}</span>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>{payment.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(payment.amount))}</span>
              </div>
              
              <div className="text-center mt-4 text-xs text-muted-foreground">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated receipt.</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleEmail} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};