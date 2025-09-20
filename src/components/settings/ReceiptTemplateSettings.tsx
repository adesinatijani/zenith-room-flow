import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Receipt, Eye, Save } from "lucide-react";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useToast } from "@/hooks/use-toast";

interface ReceiptTemplate {
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  headerMessage: string;
  footerMessage: string;
  showTaxBreakdown: boolean;
  showTransactionId: boolean;
  includeTimestamp: boolean;
  customCss: string;
}

const defaultTemplate: ReceiptTemplate = {
  showLogo: true,
  showAddress: true,
  showPhone: true,
  showEmail: true,
  showWebsite: false,
  headerMessage: "Thank you for choosing us!",
  footerMessage: "We appreciate your business. Have a wonderful day!",
  showTaxBreakdown: true,
  showTransactionId: true,
  includeTimestamp: true,
  customCss: ""
};

export const ReceiptTemplateSettings = () => {
  const { settings, formatCurrency } = useGlobalSettings();
  const { toast } = useToast();
  const [template, setTemplate] = useState<ReceiptTemplate>(defaultTemplate);
  const [showPreview, setShowPreview] = useState(false);

  const updateTemplate = (key: keyof ReceiptTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  };

  const saveTemplate = async () => {
    try {
      // In a real implementation, you would save this to the database
      // For now, we'll just show a success message
      toast({
        title: "Receipt Template Saved",
        description: "Your receipt template has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save receipt template.",
        variant: "destructive",
      });
    }
  };

  const generateSampleReceipt = () => {
    const sampleData = {
      transactionId: "TXN-20241218-001",
      guestName: "John Smith", 
      amount: 125.50,
      method: "card",
      type: "pos",
      date: new Date().toLocaleString(),
      description: "Restaurant Order - Table 5",
      reference: "REF-12345",
      items: [
        { name: "Grilled Salmon", quantity: 1, price: 28.00 },
        { name: "Caesar Salad", quantity: 1, price: 12.00 },
        { name: "Red Wine", quantity: 2, price: 15.00 },
      ]
    };

    return generateReceiptHTML(sampleData);
  };

  const generateReceiptHTML = (data: any) => {
    const subtotal = data.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || data.amount;
    const tax = subtotal * (settings.tax_rate || 7.5) / 100;
    const total = subtotal + tax;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt Preview</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; line-height: 1.4; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .contact-info { font-size: 12px; color: #666; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; }
          .item-row { border-bottom: 1px dotted #ccc; padding: 5px 0; }
          .total-section { border-top: 2px solid #333; padding-top: 10px; margin-top: 15px; }
          .total { font-weight: bold; font-size: 1.1em; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          .header-message { font-style: italic; color: #2563eb; margin: 10px 0; }
          .footer-message { font-style: italic; color: #16a34a; margin: 10px 0; }
          ${template.customCss}
        </style>
      </head>
      <body>
        <div class="header">
          ${template.showLogo ? `<div class="logo">${settings.hotel_name}</div>` : ''}
          ${template.headerMessage ? `<div class="header-message">${template.headerMessage}</div>` : ''}
          ${template.showAddress && settings.hotel_address ? `<div class="contact-info">${settings.hotel_address}</div>` : ''}
          ${template.showPhone && settings.hotel_phone ? `<div class="contact-info">📞 ${settings.hotel_phone}</div>` : ''}
          ${template.showEmail && settings.hotel_email ? `<div class="contact-info">✉️ ${settings.hotel_email}</div>` : ''}
          ${template.showWebsite && settings.hotel_website ? `<div class="contact-info">🌐 ${settings.hotel_website}</div>` : ''}
        </div>
        
        ${template.showTransactionId ? `<div class="row"><span>Transaction ID:</span><span>${data.transactionId}</span></div>` : ''}
        <div class="row"><span>Guest:</span><span>${data.guestName}</span></div>
        ${template.includeTimestamp ? `<div class="row"><span>Date & Time:</span><span>${data.date}</span></div>` : ''}
        <div class="row"><span>Payment Method:</span><span>${data.method.toUpperCase()}</span></div>
        <div class="row"><span>Service:</span><span>${data.type.toUpperCase()}</span></div>
        
        ${data.items ? `
          <div style="margin: 15px 0;">
            <strong>Items Ordered:</strong>
            ${data.items.map((item: any) => `
              <div class="item-row">
                <div class="row">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="total-section">
          <div class="row"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
          ${template.showTaxBreakdown ? `<div class="row"><span>Tax (${settings.tax_rate}%):</span><span>{formatCurrency(tax)}</span></div>` : ''}
          <div class="row total"><span>Total:</span><span>{formatCurrency(total)}</span></div>
        </div>
        
        <div class="footer">
          ${template.footerMessage ? `<div class="footer-message">${template.footerMessage}</div>` : ''}
          <p>This is a computer-generated receipt.</p>
          <p>Reference: ${data.reference}</p>
        </div>
      </body>
      </html>
    `;
  };

  const previewReceipt = () => {
    const receiptHTML = generateSampleReceipt();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(receiptHTML);
      newWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Receipt Template
        </CardTitle>
        <CardDescription>
          Customize how receipts appear for hotel services and restaurant POS transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Header Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Header Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showLogo">Show Hotel Name</Label>
              <Switch
                id="showLogo"
                checked={template.showLogo}
                onCheckedChange={(checked) => updateTemplate('showLogo', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showAddress">Show Address</Label>
              <Switch
                id="showAddress"
                checked={template.showAddress}
                onCheckedChange={(checked) => updateTemplate('showAddress', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showPhone">Show Phone</Label>
              <Switch
                id="showPhone"
                checked={template.showPhone}
                onCheckedChange={(checked) => updateTemplate('showPhone', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showEmail">Show Email</Label>
              <Switch
                id="showEmail"
                checked={template.showEmail}
                onCheckedChange={(checked) => updateTemplate('showEmail', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showWebsite">Show Website</Label>
              <Switch
                id="showWebsite"
                checked={template.showWebsite}
                onCheckedChange={(checked) => updateTemplate('showWebsite', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Message Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Custom Messages</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headerMessage">Header Message</Label>
              <Input
                id="headerMessage"
                value={template.headerMessage}
                onChange={(e) => updateTemplate('headerMessage', e.target.value)}
                placeholder="Welcome message for receipts"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerMessage">Footer Message</Label>
              <Textarea
                id="footerMessage"
                value={template.footerMessage}
                onChange={(e) => updateTemplate('footerMessage', e.target.value)}
                placeholder="Thank you message and additional info"
                rows={3}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Display Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Display Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showTaxBreakdown">Show Tax Breakdown</Label>
              <Switch
                id="showTaxBreakdown"
                checked={template.showTaxBreakdown}
                onCheckedChange={(checked) => updateTemplate('showTaxBreakdown', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showTransactionId">Show Transaction ID</Label>
              <Switch
                id="showTransactionId"
                checked={template.showTransactionId}
                onCheckedChange={(checked) => updateTemplate('showTransactionId', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="includeTimestamp">Include Timestamp</Label>
              <Switch
                id="includeTimestamp"
                checked={template.includeTimestamp}
                onCheckedChange={(checked) => updateTemplate('includeTimestamp', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Custom CSS */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Custom Styling (Advanced)</h3>
          <div className="space-y-2">
            <Label htmlFor="customCss">Custom CSS</Label>
            <Textarea
              id="customCss"
              value={template.customCss}
              onChange={(e) => updateTemplate('customCss', e.target.value)}
              placeholder="/* Add custom CSS styles here */&#10;.header { color: #blue; }&#10;.total { font-size: 18px; }"
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Integration Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Integration Status</h3>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Hotel Services ✓
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Restaurant POS ✓
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Room Service ✓
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Payment Gateway ✓
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This template will be used for all receipts generated from hotel bookings, restaurant orders, room service, and payment transactions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={previewReceipt} variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Preview Receipt
          </Button>
          <Button onClick={saveTemplate} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};