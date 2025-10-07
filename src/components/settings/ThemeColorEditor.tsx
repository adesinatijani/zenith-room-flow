import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ThemeColorEditorProps {
  settings: any;
  onUpdate: () => void;
}

const DEFAULT_COLORS = {
  primary_color: '222.2 84% 4.9%',
  accent_color: '346.8 77.2% 49.8%',
  background_color: '0 0% 100%',
  text_color: '222.2 84% 4.9%',
  card_color: '0 0% 100%',
  border_color: '214.3 31.8% 91.4%'
};

export const ThemeColorEditor = ({ settings, onUpdate }: ThemeColorEditorProps) => {
  const [colors, setColors] = useState({
    primary_color: settings?.primary_color || DEFAULT_COLORS.primary_color,
    accent_color: settings?.accent_color || DEFAULT_COLORS.accent_color,
    background_color: settings?.background_color || DEFAULT_COLORS.background_color,
    text_color: settings?.text_color || DEFAULT_COLORS.text_color,
    card_color: settings?.card_color || DEFAULT_COLORS.card_color,
    border_color: settings?.border_color || DEFAULT_COLORS.border_color
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('hotel_settings')
        .update(colors)
        .eq('id', settings.id);

      if (error) throw error;

      // Apply colors to CSS variables
      applyColorsToCSS(colors);

      toast({
        title: "Success",
        description: "Theme colors updated successfully",
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving colors:', error);
      toast({
        title: "Error",
        description: "Failed to save theme colors",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setColors(DEFAULT_COLORS);
    applyColorsToCSS(DEFAULT_COLORS);
  };

  const applyColorsToCSS = (colorValues: typeof colors) => {
    const root = document.documentElement;
    Object.entries(colorValues).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/_/g, '-')}`;
      root.style.setProperty(cssVar, value);
    });
  };

  const parseColorToHex = (color: string): string => {
    color = color.trim();
    
    // If it's already hex, return it
    if (color.startsWith('#')) return color;
    
    // Try to parse HSL format: "hue saturation% lightness%"
    const hslMatch = color.match(/^(\d+\.?\d*)\s+(\d+\.?\d*)%?\s+(\d+\.?\d*)%?$/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      const hDecimal = parseFloat(h) / 360;
      const sDecimal = parseFloat(s) / 100;
      const lDecimal = parseFloat(l) / 100;
      
      const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
      const x = c * (1 - Math.abs((hDecimal * 6) % 2 - 1));
      const m = lDecimal - c / 2;
      
      let r = 0, g = 0, b = 0;
      
      if (hDecimal < 1/6) { r = c; g = x; }
      else if (hDecimal < 2/6) { r = x; g = c; }
      else if (hDecimal < 3/6) { g = c; b = x; }
      else if (hDecimal < 4/6) { g = x; b = c; }
      else if (hDecimal < 5/6) { r = x; b = c; }
      else { r = c; b = x; }
      
      const toHex = (n: number) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    // Try to parse RGB format: "r g b" or "rgb(r, g, b)"
    const rgbMatch = color.match(/rgba?\(?\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/i) || 
                     color.match(/^(\d+)\s+(\d+)\s+(\d+)$/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      const toHex = (n: string) => {
        const hex = parseInt(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    // Fallback: return a default color
    return '#cccccc';
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `${h} ${s}% ${l}%`;
  };

  const colorFields = [
    { key: 'primary_color', label: 'Primary Color', description: 'Main brand color' },
    { key: 'accent_color', label: 'Accent Color', description: 'Highlight and emphasis color' },
    { key: 'background_color', label: 'Background Color', description: 'Page background' },
    { key: 'text_color', label: 'Text Color', description: 'Main text color' },
    { key: 'card_color', label: 'Card Color', description: 'Card and container background' },
    { key: 'border_color', label: 'Border Color', description: 'Borders and dividers' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Colors
            </CardTitle>
            <CardDescription>
              Customize your hotel's color scheme (HSL format: "hue saturation% lightness%")
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {colorFields.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <p className="text-xs text-muted-foreground">{description}</p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={parseColorToHex(colors[key as keyof typeof colors])}
                  onChange={(e) => handleColorChange(key, hexToHsl(e.target.value))}
                  className="w-12 h-10 rounded border-2 border-border flex-shrink-0 cursor-pointer"
                />
                <Input
                  id={key}
                  value={colors[key as keyof typeof colors]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  placeholder="HSL: 222.2 84% 4.9% or RGB: 255 0 0"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Color Format Guide</h4>
            <p className="text-xs text-muted-foreground">
              HSL format: <code className="bg-background px-1 py-0.5 rounded">346.8 77.2% 49.8%</code> (hue saturation% lightness%)
            </p>
            <p className="text-xs text-muted-foreground">
              RGB format: <code className="bg-background px-1 py-0.5 rounded">255 0 0</code> or <code className="bg-background px-1 py-0.5 rounded">rgb(255, 0, 0)</code>
            </p>
            <p className="text-xs text-muted-foreground">
              Or use the color picker for easy selection
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Theme Colors'}
        </Button>
      </CardContent>
    </Card>
  );
};