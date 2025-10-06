-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  preparation_time INTEGER DEFAULT 15,
  calories INTEGER,
  is_popular BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  allergens TEXT[] DEFAULT '{}',
  ingredients TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items
CREATE POLICY "Staff can view menu items"
  ON public.menu_items
  FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Management can insert menu items"
  ON public.menu_items
  FOR INSERT
  WITH CHECK (has_management_access());

CREATE POLICY "Management can update menu items"
  ON public.menu_items
  FOR UPDATE
  USING (has_management_access())
  WITH CHECK (has_management_access());

CREATE POLICY "Management can delete menu items"
  ON public.menu_items
  FOR DELETE
  USING (has_management_access());

-- Add trigger for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();