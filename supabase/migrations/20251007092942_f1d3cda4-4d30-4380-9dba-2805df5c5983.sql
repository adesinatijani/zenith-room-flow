-- Create content_pages table for managing frontend content
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- Everyone can read published content
CREATE POLICY "Anyone can view published content"
  ON public.content_pages
  FOR SELECT
  USING (is_published = true);

-- Only admins can manage content
CREATE POLICY "Admins can manage all content"
  ON public.content_pages
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_content_pages_updated_at
  BEFORE UPDATE ON public.content_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default homepage content
INSERT INTO public.content_pages (page_slug, page_title, content) VALUES
('home', 'Homepage', '{
  "hero": {
    "title": "Experience Luxury",
    "subtitle": "World-class amenities, exceptional service, and unforgettable memories await you"
  },
  "about": {
    "title": "Complete Hotel Management Solution",
    "description": "Our comprehensive system handles every aspect of hotel operations with modern, touch-friendly interfaces"
  },
  "contact": {
    "title": "Get In Touch",
    "description": "Ready to experience luxury? Contact us today"
  }
}'::jsonb),
('about', 'About Us', '{
  "title": "About Our Hotel",
  "description": "We provide world-class hospitality services",
  "mission": "To deliver exceptional experiences to every guest",
  "vision": "To be the leading luxury hotel management system"
}'::jsonb),
('contact', 'Contact Us', '{
  "title": "Contact Information",
  "description": "Get in touch with our team"
}'::jsonb)
ON CONFLICT (page_slug) DO NOTHING;