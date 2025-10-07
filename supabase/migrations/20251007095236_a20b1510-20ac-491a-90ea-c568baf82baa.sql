-- Update home page content to include color fields for hero sections
UPDATE public.content_pages
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(content, '{}'::jsonb),
      '{hero,background_color}',
      '"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"'::jsonb
    ),
    '{hero,text_color}',
    '"#ffffff"'::jsonb
  ),
  '{hero,accent_color}',
  '"#fbbf24"'::jsonb
)
WHERE page_slug = 'home';

-- Ensure hero section has default values if it doesn't exist
UPDATE public.content_pages
SET content = jsonb_set(
  COALESCE(content, '{}'::jsonb),
  '{hero}',
  jsonb_build_object(
    'title', 'Experience',
    'subtitle', 'World-class amenities, exceptional service, and unforgettable memories await you',
    'background_color', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'text_color', '#ffffff',
    'accent_color', '#fbbf24'
  )
)
WHERE page_slug = 'home' AND (content->'hero') IS NULL;