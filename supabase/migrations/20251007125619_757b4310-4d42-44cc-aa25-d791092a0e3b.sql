-- Extend hotel_settings table with additional CMS fields
ALTER TABLE public.hotel_settings
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS site_title TEXT DEFAULT 'Hotel Management System',
ADD COLUMN IF NOT EXISTS hero_image_opacity NUMERIC DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS hero_background_opacity NUMERIC DEFAULT 0.9,
ADD COLUMN IF NOT EXISTS advertisements JSONB DEFAULT '[]'::jsonb;

-- Update existing row if it exists, otherwise create default
INSERT INTO public.hotel_settings (
  id,
  logo_url,
  favicon_url,
  site_title,
  hero_image_opacity,
  hero_background_opacity,
  advertisements
) VALUES (
  gen_random_uuid(),
  '/placeholder.svg',
  '/favicon.ico',
  'ALOKOLODO HOTELS Management System',
  0.7,
  0.9,
  '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  logo_url = COALESCE(public.hotel_settings.logo_url, EXCLUDED.logo_url),
  favicon_url = COALESCE(public.hotel_settings.favicon_url, EXCLUDED.favicon_url),
  site_title = COALESCE(public.hotel_settings.site_title, EXCLUDED.site_title),
  hero_image_opacity = COALESCE(public.hotel_settings.hero_image_opacity, EXCLUDED.hero_image_opacity),
  hero_background_opacity = COALESCE(public.hotel_settings.hero_background_opacity, EXCLUDED.hero_background_opacity),
  advertisements = COALESCE(public.hotel_settings.advertisements, EXCLUDED.advertisements);