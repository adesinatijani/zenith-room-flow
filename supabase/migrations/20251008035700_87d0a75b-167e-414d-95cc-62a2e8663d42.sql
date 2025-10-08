-- Enable realtime for menu_items table
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;

-- Add menu_items to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;