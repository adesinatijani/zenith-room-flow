import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface FooterEditorProps {
  footerContent: any;
  onChange: (content: any) => void;
}

export const FooterEditor = ({ footerContent, onChange }: FooterEditorProps) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...footerContent, [field]: value });
  };

  const addQuickLink = () => {
    const links = [...(footerContent.quick_links || []), { text: "New Link", url: "/" }];
    updateField('quick_links', links);
  };

  const updateQuickLink = (index: number, field: string, value: string) => {
    const links = [...footerContent.quick_links];
    links[index] = { ...links[index], [field]: value };
    updateField('quick_links', links);
  };

  const removeQuickLink = (index: number) => {
    const links = footerContent.quick_links.filter((_: any, i: number) => i !== index);
    updateField('quick_links', links);
  };

  const updateSocial = (platform: string, value: string) => {
    updateField('social_links', { ...footerContent.social_links, [platform]: value });
  };

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Contact details shown in footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name/Description</Label>
            <Input
              value={footerContent.company_info || ''}
              onChange={(e) => updateField('company_info', e.target.value)}
              placeholder="Your Hotel - Luxury Accommodation"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={footerContent.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={footerContent.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="info@hotel.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={footerContent.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="123 Hotel Street, City, Country"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Add your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input
                value={footerContent.social_links?.facebook || ''}
                onChange={(e) => updateSocial('facebook', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter</Label>
              <Input
                value={footerContent.social_links?.twitter || ''}
                onChange={(e) => updateSocial('twitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                value={footerContent.social_links?.instagram || ''}
                onChange={(e) => updateSocial('instagram', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Navigation links in footer</CardDescription>
            </div>
            <Button size="sm" onClick={addQuickLink}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerContent.quick_links?.map((link: any, index: number) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Link Text</Label>
                <Input
                  value={link.text}
                  onChange={(e) => updateQuickLink(index, 'text', e.target.value)}
                  placeholder="About Us"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>URL</Label>
                <Input
                  value={link.url}
                  onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                  placeholder="/about"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuickLink(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
