import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContentPages } from "@/hooks/useContentPages";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ContentManagement = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { pages, loading, updatePage, getPageBySlug } = useContentPages();
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [editingContent, setEditingContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!currentPage || !editingContent) return;
    
    setIsSaving(true);
    try {
      await updatePage(currentPage.id, { 
        content: editingContent
      });
    } catch (error) {
      console.error('Error saving:', error);
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
                <p className="text-sm text-muted-foreground">Edit your website content</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving || !editingContent}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
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
      </div>
    </div>
  );
};

export default ContentManagement;