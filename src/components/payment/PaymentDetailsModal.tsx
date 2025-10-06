import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  MapPin, 
  FileText, 
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  transactionId: string;
  guestName: string;
  amount: number;
  method: 'card' | 'cash' | 'bank' | 'paystack' | 'flutterwave';
  type: 'booking' | 'pos' | 'service' | 'refund';
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'active' | 'cancelled';
  date: string;
  description: string;
  roomNumber?: string;
  reference: string;
}

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const PaymentDetailsModal = ({ isOpen, onClose, payment }: PaymentDetailsModalProps) => {
  const { toast } = useToast();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      case 'refunded': return 'bg-muted text-muted-foreground';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertCircle;
      case 'refunded': return RefreshCw;
      default: return Clock;
    }
  };

  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(payment.transactionId);
    toast({
      title: "Copied",
      description: "Transaction ID copied to clipboard",
    });
  };

  const StatusIcon = getStatusIcon(payment.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Complete information for transaction {payment.transactionId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{payment.guestName}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{payment.transactionId}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopyTransactionId}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">
                    {payment.amount < 0 ? '-' : ''}${Math.abs(payment.amount).toFixed(2)}
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {payment.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <Badge className={getMethodBadge(payment.method)}>
                    {payment.method.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Type:</span>
                  <span className="font-medium capitalize">{payment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{payment.reference}</code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-medium">{payment.date}</span>
                </div>
                {payment.roomNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Room Number:
                    </span>
                    <span className="font-medium">{payment.roomNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-lg">
                    {payment.amount < 0 ? '-' : ''}${Math.abs(payment.amount).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{payment.description}</p>
            </CardContent>
          </Card>

          {/* Transaction Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-muted-foreground">Transaction Initiated</span>
                  <span className="ml-auto">{payment.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-muted-foreground">Payment Processed</span>
                  <span className="ml-auto">{payment.date}</span>
                </div>
                {payment.status === 'completed' && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-muted-foreground">Transaction Completed</span>
                    <span className="ml-auto">{payment.date}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline">
              Print Receipt
            </Button>
            {payment.status === 'completed' && payment.type !== 'refund' && (
              <Button variant="outline">
                Process Refund
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};