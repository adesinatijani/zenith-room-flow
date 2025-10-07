import { supabase } from "@/integrations/supabase/client";

export const applyThemeColors = async () => {
  try {
    const { data, error } = await supabase
      .from('hotel_settings')
      .select('primary_color, accent_color, background_color, text_color, card_color, border_color')
      .maybeSingle();

    if (error || !data) {
      console.log('No theme colors found, using defaults');
      return;
    }

    const root = document.documentElement;
    
    if (data.primary_color) root.style.setProperty('--primary', data.primary_color);
    if (data.accent_color) root.style.setProperty('--accent', data.accent_color);
    if (data.background_color) root.style.setProperty('--background', data.background_color);
    if (data.text_color) root.style.setProperty('--foreground', data.text_color);
    if (data.card_color) root.style.setProperty('--card', data.card_color);
    if (data.border_color) root.style.setProperty('--border', data.border_color);
  } catch (error) {
    console.error('Error applying theme colors:', error);
  }
};

export const resetThemeColors = () => {
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--accent');
  root.style.removeProperty('--background');
  root.style.removeProperty('--foreground');
  root.style.removeProperty('--card');
  root.style.removeProperty('--border');
};