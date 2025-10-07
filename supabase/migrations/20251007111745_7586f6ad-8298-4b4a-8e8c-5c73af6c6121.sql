-- Create the content_pages table
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all content" ON public.content_pages;
DROP POLICY IF EXISTS "Anyone can view published content" ON public.content_pages;

-- Create policies for admins to manage content
CREATE POLICY "Admins can manage all content" 
  ON public.content_pages 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::app_role
    )
  );

-- Allow anyone to view published content
CREATE POLICY "Anyone can view published content" 
  ON public.content_pages 
  FOR SELECT 
  USING (is_published = true);

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for content_pages
DROP TRIGGER IF EXISTS update_content_pages_updated_at ON public.content_pages;
CREATE TRIGGER update_content_pages_updated_at 
  BEFORE UPDATE ON public.content_pages
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content pages
INSERT INTO public.content_pages (page_slug, page_title, content, is_published) VALUES
('home', 'Home Page', '{
  "hero": {
    "title": "Welcome to Our Hotel",
    "subtitle": "Experience luxury and comfort",
    "background_color": "#1a1a1a"
  },
  "features": {
    "feature1": "24/7 Service",
    "feature2": "Luxury Rooms",
    "feature3": "Fine Dining"
  }
}'::jsonb, true),

('about', 'About Us', '{
  "title": "About Our Hotel",
  "description": "We provide the best hospitality services",
  "mission": "To deliver exceptional guest experiences"
}'::jsonb, true),

('contact', 'Contact Us', '{
  "title": "Get In Touch",
  "email": "info@hotel.com",
  "phone": "+1234567890",
  "address": "123 Hotel Street"
}'::jsonb, true)
ON CONFLICT (page_slug) DO NOTHING;