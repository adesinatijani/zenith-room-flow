-- Add theme/color columns to hotel_settings
ALTER TABLE public.hotel_settings 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '222.2 84% 4.9%',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '346.8 77.2% 49.8%',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '0 0% 100%',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '222.2 84% 4.9%',
ADD COLUMN IF NOT EXISTS card_color TEXT DEFAULT '0 0% 100%',
ADD COLUMN IF NOT EXISTS border_color TEXT DEFAULT '214.3 31.8% 91.4%';

-- Update default settings if exists
UPDATE public.hotel_settings 
SET 
  primary_color = COALESCE(primary_color, '222.2 84% 4.9%'),
  accent_color = COALESCE(accent_color, '346.8 77.2% 49.8%'),
  background_color = COALESCE(background_color, '0 0% 100%'),
  text_color = COALESCE(text_color, '222.2 84% 4.9%'),
  card_color = COALESCE(card_color, '0 0% 100%'),
  border_color = COALESCE(border_color, '214.3 31.8% 91.4%')
WHERE primary_color IS NULL;