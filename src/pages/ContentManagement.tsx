import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContentPages } from "@/hooks/useContentPages";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, EyeOff, Settings, Palette, Megaphone, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { updateSiteSettings } from "@/utils/dynamicSiteSettings";

const ContentManagement = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { pages, loading, updatePage } = useContentPages();
  const { settings, saveSettings, fetchSettings, loading: settingsLoading } = useGlobalSettings();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>("content");
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editingSettings, setEditingSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !editingSettings) {
      setEditingSettings(settings);
    }
  }, [settings]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/auth');
    return null;
  }

  const currentPage = pages.find(p => p.page_slug === selectedPage);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedTab === "content") {
        if (!currentPage || !editingContent) return;
        await updatePage(currentPage.id, { 
          content: editingContent
        });
        toast.success("Page content saved successfully");
      } else {
        if (!editingSettings) return;
        await saveSettings(editingSettings);
        await updateSiteSettings();
        await fetchSettings();
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditor = (content: any, path: string[] = []) => {
    if (!content) return null;

    return Object.entries(content).map(([key, value]) => {
      const currentPath = [...path, key];
      const pathString = currentPath.join('.');

      if (typeof value === 'object' && value !== null) {
        return (
          <Card key={pathString} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg capitalize">{key.replace(/_/g, ' ')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderEditor(value, currentPath)}
            </CardContent>
          </Card>
        );
      }

      // Check if this is a color field
      const isColorField = key.toLowerCase().includes('color');
      
      return (
        <div key={pathString} className="space-y-2">
          <Label htmlFor={pathString} className="capitalize">
            {key.replace(/_/g, ' ')}
          </Label>
          {isColorField ? (
            <div className="flex gap-2">
              <input
                type="color"
                value={typeof value === 'string' && value.startsWith('#') ? value : '#cccccc'}
                onChange={(e) => {
                  const newContent = { ...editingContent };
                  let current = newContent;
                  for (let i = 0; i < currentPath.length - 1; i++) {
                    current = current[currentPath[i]];
                  }
                  current[key] = e.target.value;
                  setEditingContent({ ...newContent });
                }}
                className="w-12 h-10 rounded border-2 border-border cursor-pointer"
              />
              <Input
                id={pathString}
                value={value as string}
                onChange={(e) => {
                  const newContent = { ...editingContent };
                  let current = newContent;
                  for (let i = 0; i < currentPath.length - 1; i++) {
                    current = current[currentPath[i]];
                  }
                  current[key] = e.target.value;
                  setEditingContent({ ...newContent });
                }}
                placeholder="e.g., #ff0000 or rgb(255,0,0)"
                className="font-mono"
              />
            </div>
          ) : typeof value === 'string' && value.length > 100 ? (
            <Textarea
              id={pathString}
              value={value as string}
              onChange={(e) => {
                const newContent = { ...editingContent };
                let current = newContent;
                for (let i = 0; i < currentPath.length - 1; i++) {
                  current = current[currentPath[i]];
                }
                current[key] = e.target.value;
                setEditingContent({ ...newContent });
              }}
              rows={4}
            />
          ) : (
            <Input
              id={pathString}
              value={value as string}
              onChange={(e) => {
                const newContent = { ...editingContent };
                let current = newContent;
                for (let i = 0; i < currentPath.length - 1; i++) {
                  current = current[currentPath[i]];
                }
                current[key] = e.target.value;
                setEditingContent({ ...newContent });
              }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Content Management</h1>
                <p className="text-sm text-muted-foreground">Edit your website content and settings</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving || (!editingContent && !editingSettings)}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Page Content
            </TabsTrigger>
            <TabsTrigger value="site">
              <Settings className="h-4 w-4 mr-2" />
              Site Settings
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Theme & Opacity
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Megaphone className="h-4 w-4 mr-2" />
              Advertisements
            </TabsTrigger>
          </TabsList>

          {/* Page Content Tab */}
          <TabsContent value="content">
            <Tabs value={selectedPage} onValueChange={setSelectedPage}>
              <TabsList className="mb-6">
                {pages.map((page) => (
                  <TabsTrigger 
                    key={page.page_slug} 
                    value={page.page_slug}
                    onClick={() => setEditingContent(page.content)}
                  >
                    {page.page_title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {pages.map((page) => (
                <TabsContent key={page.page_slug} value={page.page_slug}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{page.page_title}</CardTitle>
                          <CardDescription>Edit content for {page.page_slug} page</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={page.is_published}
                            onCheckedChange={(checked) => updatePage(page.id, { is_published: checked })}
                          />
                          <Label className="flex items-center gap-2">
                            {page.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {page.is_published ? 'Published' : 'Draft'}
                          </Label>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingContent && renderEditor(editingContent)}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Manage logo, favicon, and site title</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={editingSettings?.site_title || ''}
                    onChange={(e) => setEditingSettings({ ...editingSettings, site_title: e.target.value })}
                    placeholder="My Hotel Management System"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={editingSettings?.logo_url || ''}
                    onChange={(e) => setEditingSettings({ ...editingSettings, logo_url: e.target.value })}
                    placeholder="/placeholder.svg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={editingSettings?.favicon_url || ''}
                    onChange={(e) => setEditingSettings({ ...editingSettings, favicon_url: e.target.value })}
                    placeholder="/favicon.ico"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme & Opacity Tab */}
          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Opacity Settings</CardTitle>
                <CardDescription>Customize hero section opacity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Hero Image Opacity: {((editingSettings?.hero_image_opacity || 0.7) * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[(editingSettings?.hero_image_opacity || 0.7) * 100]}
                      onValueChange={(value) => setEditingSettings({ 
                        ...editingSettings, 
                        hero_image_opacity: value[0] / 100 
                      })}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Hero Background Opacity: {((editingSettings?.hero_background_opacity || 0.9) * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[(editingSettings?.hero_background_opacity || 0.9) * 100]}
                      onValueChange={(value) => setEditingSettings({ 
                        ...editingSettings, 
                        hero_background_opacity: value[0] / 100 
                      })}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advertisements Tab */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle>Advertisement Management</CardTitle>
                <CardDescription>Manage advertisements on your homepage</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(editingSettings?.advertisements || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const ads = JSON.parse(e.target.value);
                      setEditingSettings({ ...editingSettings, advertisements: ads });
                    } catch (error) {
                      console.error('Invalid JSON');
                    }
                  }}
                  rows={10}
                  className="font-mono"
                  placeholder='[{"image": "/ad1.jpg", "link": "https://example.com", "title": "Special Offer"}]'
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Enter advertisements as JSON array with image, link, and title fields
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentManagement;