import { 
  Settings as SettingsIcon, 
  Globe, 
  DollarSign, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Hotel,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useHotelSettings } from "@/hooks/useHotelSettings";
import { ReceiptTemplateSettings } from "@/components/settings/ReceiptTemplateSettings";

const Settings = () => {
  const { 
    settings, 
    loading, 
    saving, 
    updateSetting, 
    updatePaymentGateway, 
    saveSettings 
  } = useHotelSettings();

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
    { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "EGP", name: "Egyptian Pound", symbol: "£E" },
    { code: "MAD", name: "Moroccan Dirham", symbol: "DH" },
    { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
    { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
    { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
    { code: "XOF", name: "West African CFA Franc", symbol: "F CFA" },
    { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
  ];

  const timezones = [
    { code: "UTC", name: "UTC (Coordinated Universal Time)" },
    { code: "America/New_York", name: "Eastern Time (US & Canada)" },
    { code: "America/Chicago", name: "Central Time (US & Canada)" },
    { code: "America/Denver", name: "Mountain Time (US & Canada)" },
    { code: "America/Los_Angeles", name: "Pacific Time (US & Canada)" },
    { code: "Europe/London", name: "London" },
    { code: "Europe/Paris", name: "Paris" },
    { code: "Africa/Lagos", name: "Lagos" },
    { code: "Africa/Cairo", name: "Cairo" },
    { code: "Asia/Dubai", name: "Dubai" },
    { code: "Asia/Kolkata", name: "Mumbai, New Delhi" },
    { code: "Asia/Shanghai", name: "Beijing, Shanghai" },
    { code: "Asia/Tokyo", name: "Tokyo" },
    { code: "Australia/Sydney", name: "Sydney" },
  ];

  const handleSaveSettings = async () => {
    try {
      await saveSettings(settings);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-accent" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your hotel system preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="button-luxury" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Hotel Information */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-accent" />
              Hotel Information
            </CardTitle>
            <CardDescription>Basic information about your hotel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hotel-name">Hotel Name</Label>
                <Input
                  id="hotel-name"
                  value={settings.hotel_name}
                  onChange={(e) => updateSetting('hotel_name', e.target.value)}
                  placeholder="Enter hotel name"
                />
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="hotel-icon">Hotel Icon</Label>
                 <Select
                   value={settings.hotel_icon || "Hotel"}
                   onValueChange={(value) => updateSetting('hotel_icon', value)}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select an icon" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Hotel">🏨 Hotel</SelectItem>
                     <SelectItem value="Home">🏠 Home</SelectItem>
                     <SelectItem value="Building">🏢 Building</SelectItem>
                     <SelectItem value="Castle">🏰 Castle</SelectItem>
                     <SelectItem value="Star">⭐ Star</SelectItem>
                     <SelectItem value="Crown">👑 Crown</SelectItem>
                     <SelectItem value="Gem">💎 Gem</SelectItem>
                     <SelectItem value="Key">🗝️ Key</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="hotel-email">Email Address</Label>
                 <Input
                   id="hotel-email"
                   type="email"
                   value={settings.hotel_email || ""}
                   onChange={(e) => updateSetting('hotel_email', e.target.value)}
                   placeholder="Enter hotel email"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="hotel-address">Address</Label>
               <Textarea
                 id="hotel-address"
                 value={settings.hotel_address || ""}
                 onChange={(e) => updateSetting('hotel_address', e.target.value)}
                 placeholder="Enter full hotel address"
                 rows={3}
               />
             </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hotel-phone">Phone Number</Label>
                <Input
                  id="hotel-phone"
                  value={settings.hotel_phone || ""}
                  onChange={(e) => updateSetting('hotel_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hotel-whatsapp">WhatsApp Number</Label>
                <Input
                  id="hotel-whatsapp"
                  value={settings.hotel_whatsapp || ""}
                  onChange={(e) => updateSetting('hotel_whatsapp', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hotel-website">Website URL</Label>
                <Input
                  id="hotel-website"
                  type="url"
                  value={settings.hotel_website || ""}
                  onChange={(e) => updateSetting('hotel_website', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel-description">Hotel Description</Label>
              <Textarea
                id="hotel-description"
                value={settings.hotel_description || ""}
                onChange={(e) => updateSetting('hotel_description', e.target.value)}
                placeholder="Brief description of your hotel"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency & Localization */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Currency & Localization
            </CardTitle>
            <CardDescription>Set your default currency and regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{curr.symbol}</span>
                          <span>{curr.name} ({curr.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Tax Rates Configuration</Label>
                <p className="text-sm text-muted-foreground">Set different tax rates for different services</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.1"
                    value={settings.tax_rate}
                    onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Global default for all items</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kitchen-tax-rate">Kitchen/Restaurant Tax (%)</Label>
                  <Input
                    id="kitchen-tax-rate"
                    type="number"
                    step="0.1"
                    value={settings.tax_rate}
                    onChange={async (e) => {
                      const newRate = parseFloat(e.target.value) || 0;
                      updateSetting('tax_rate', newRate);
                      // Update all menu items
                      const { error } = await supabase
                        .from('menu_items')
                        .update({ tax_rate: newRate })
                        .neq('id', '00000000-0000-0000-0000-000000000000');
                      if (error) console.error('Error updating menu items tax:', error);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Applied to all food & beverage</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room-tax-rate">Room Tax (%)</Label>
                  <Input
                    id="room-tax-rate"
                    type="number"
                    step="0.1"
                    value={settings.tax_rate}
                    onChange={async (e) => {
                      const newRate = parseFloat(e.target.value) || 0;
                      updateSetting('tax_rate', newRate);
                      // Update all rooms
                      const { error } = await supabase
                        .from('rooms')
                        .update({ tax_rate: newRate })
                        .neq('id', '00000000-0000-0000-0000-000000000000');
                      if (error) console.error('Error updating rooms tax:', error);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Applied to room bookings</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.code} value={tz.code}>
                        {tz.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select value={settings.time_format} onValueChange={(value) => updateSetting('time_format', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive booking and system alerts via email</p>
              </div>
              <Switch 
                checked={settings.email_notifications} 
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Get urgent notifications via SMS</p>
              </div>
              <Switch 
                checked={settings.sms_notifications} 
                onCheckedChange={(checked) => updateSetting('sms_notifications', checked)} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">Show browser notifications for real-time updates</p>
              </div>
              <Switch 
                checked={settings.desktop_notifications} 
                onCheckedChange={(checked) => updateSetting('desktop_notifications', checked)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-accent" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch 
                checked={settings.dark_mode} 
                onCheckedChange={(checked) => updateSetting('dark_mode', checked)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateways */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Payment Gateways
            </CardTitle>
            <CardDescription>Configure payment methods for your hotel system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">African Payment Gateways</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Paystack (Nigeria)</Label>
                    <p className="text-sm text-muted-foreground">Cards, Bank Transfer, USSD</p>
                  </div>
                  <Switch 
                    checked={settings.payment_gateways.paystack} 
                    onCheckedChange={(checked) => updatePaymentGateway('paystack', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Flutterwave (Multi-African)</Label>
                    <p className="text-sm text-muted-foreground">Cards, Mobile Money, Bank Transfer</p>
                  </div>
                  <Switch 
                    checked={settings.payment_gateways.flutterwave} 
                    onCheckedChange={(checked) => updatePaymentGateway('flutterwave', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile Money</Label>
                    <p className="text-sm text-muted-foreground">MTN, Airtel, Vodafone Cash</p>
                  </div>
                  <Switch 
                    checked={settings.payment_gateways.mobileMoney} 
                    onCheckedChange={(checked) => updatePaymentGateway('mobileMoney', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Global Payment Gateways</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stripe (Global)</Label>
                    <p className="text-sm text-muted-foreground">Credit/Debit Cards, Apple Pay</p>
                  </div>
                  <Switch 
                    checked={settings.payment_gateways.stripe} 
                    onCheckedChange={(checked) => updatePaymentGateway('stripe', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>PayPal</Label>
                    <p className="text-sm text-muted-foreground">PayPal wallet, Credit Cards</p>
                  </div>
                  <Switch 
                    checked={settings.payment_gateways.paypal} 
                    onCheckedChange={(checked) => updatePaymentGateway('paypal', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Razorpay (India/SEA)</Label>
                    <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking</p>
                  </div>
                  <Switch 
                    checked={settings.payment_gateways.razorpay} 
                    onCheckedChange={(checked) => updatePaymentGateway('razorpay', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Button 
                variant={settings.two_factor_enabled ? "default" : "outline"} 
                size="sm"
                onClick={() => updateSetting('two_factor_enabled', !settings.two_factor_enabled)}
              >
                {settings.two_factor_enabled ? "Enabled" : "Enable 2FA"}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
              </div>
              <Select 
                value={settings.session_timeout.toString()} 
                onValueChange={(value) => updateSetting('session_timeout', parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Template */}
        <ReceiptTemplateSettings />
      </div>
    </div>
  );
};

export default Settings;