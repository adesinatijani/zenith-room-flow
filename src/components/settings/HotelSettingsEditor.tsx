import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { Building2 } from "lucide-react";

interface HotelSettingsEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const HotelSettingsEditor = ({ isOpen, onClose }: HotelSettingsEditorProps) => {
  const { settings, updateSetting, saveSettings, saving } = useGlobalSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const currencies = [
    { code: "USD", name: "US Dollar ($)" },
    { code: "EUR", name: "Euro (€)" },
    { code: "GBP", name: "British Pound (£)" },
    { code: "NGN", name: "Nigerian Naira (₦)" },
    { code: "GHS", name: "Ghanaian Cedi (₵)" },
    { code: "KES", name: "Kenyan Shilling (KSh)" },
    { code: "ZAR", name: "South African Rand (R)" },
  ];

  const handleSave = async () => {
    try {
      await saveSettings(localSettings);
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Hotel Settings
          </DialogTitle>
          <DialogDescription>
            Configure your hotel branding and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hotel Information */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
              <CardDescription>Basic hotel details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hotel-name">Hotel Name</Label>
                <Input
                  id="hotel-name"
                  value={localSettings.hotel_name}
                  onChange={(e) => setLocalSettings({ ...localSettings, hotel_name: e.target.value })}
                  placeholder="Enter hotel name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotel-phone">Phone</Label>
                  <Input
                    id="hotel-phone"
                    value={localSettings.hotel_phone || ""}
                    onChange={(e) => setLocalSettings({ ...localSettings, hotel_phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel-email">Email</Label>
                  <Input
                    id="hotel-email"
                    type="email"
                    value={localSettings.hotel_email || ""}
                    onChange={(e) => setLocalSettings({ ...localSettings, hotel_email: e.target.value })}
                    placeholder="info@hotel.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-address">Address</Label>
                <Textarea
                  id="hotel-address"
                  value={localSettings.hotel_address || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, hotel_address: e.target.value })}
                  placeholder="Full hotel address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-website">Website</Label>
                <Input
                  id="hotel-website"
                  value={localSettings.hotel_website || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, hotel_website: e.target.value })}
                  placeholder="https://yourhotel.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Currency & Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Currency & Regional Settings</CardTitle>
              <CardDescription>Set your currency and locale preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={localSettings.currency}
                    onValueChange={(value) => setLocalSettings({ ...localSettings, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.1"
                    value={localSettings.tax_rate}
                    onChange={(e) => setLocalSettings({ ...localSettings, tax_rate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelSettingsEditor;
