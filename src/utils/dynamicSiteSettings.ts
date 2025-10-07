import { supabase } from "@/integrations/supabase/client";

export const updateSiteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('hotel_settings')
      .select('site_title, favicon_url, logo_url')
      .maybeSingle();

    if (error) {
      console.error('Error fetching site settings:', error);
      return;
    }

    if (data) {
      // Update document title
      if (data.site_title) {
        document.title = data.site_title;
      }

      // Update favicon
      if (data.favicon_url) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = data.favicon_url;
      }
    }
  } catch (error) {
    console.error('Error updating site settings:', error);
  }
};
