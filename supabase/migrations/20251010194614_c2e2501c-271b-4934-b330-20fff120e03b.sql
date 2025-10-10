-- Create recipe_ingredients table to link recipes with inventory items
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  quantity_needed NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add recipe_id to menu_items to link menu items to recipes
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL;

-- Enable RLS on recipe_ingredients
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipe_ingredients
CREATE POLICY "Staff can view recipe ingredients"
  ON public.recipe_ingredients FOR SELECT
  USING (has_hotel_staff_access());

CREATE POLICY "Kitchen and management can manage recipe ingredients"
  ON public.recipe_ingredients FOR ALL
  USING (has_kitchen_access() OR has_management_access())
  WITH CHECK (has_kitchen_access() OR has_management_access());

-- Create function to calculate recipe cost from ingredients
CREATE OR REPLACE FUNCTION public.calculate_recipe_cost(recipe_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_cost NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(ri.quantity_needed * i.cost_per_unit), 0)
  INTO total_cost
  FROM recipe_ingredients ri
  JOIN inventory i ON i.id = ri.inventory_item_id
  WHERE ri.recipe_id = recipe_uuid;
  
  RETURN total_cost;
END;
$$;

-- Create function to deduct recipe ingredients from inventory when item is sold
CREATE OR REPLACE FUNCTION public.deduct_recipe_ingredients(
  menu_item_uuid UUID,
  quantity_sold INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipe_uuid UUID;
  ingredient_record RECORD;
BEGIN
  -- Get the recipe for this menu item
  SELECT recipe_id INTO recipe_uuid
  FROM menu_items
  WHERE id = menu_item_uuid;
  
  IF recipe_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct each ingredient
  FOR ingredient_record IN 
    SELECT inventory_item_id, quantity_needed
    FROM recipe_ingredients
    WHERE recipe_id = recipe_uuid
  LOOP
    UPDATE inventory
    SET 
      current_quantity = GREATEST(0, current_quantity - (ingredient_record.quantity_needed * quantity_sold)),
      updated_at = now()
    WHERE id = ingredient_record.inventory_item_id;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- Create trigger to update recipe cost when ingredients change
CREATE OR REPLACE FUNCTION public.update_recipe_cost_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_cost NUMERIC;
BEGIN
  -- Calculate new cost
  new_cost := calculate_recipe_cost(COALESCE(NEW.recipe_id, OLD.recipe_id));
  
  -- Update recipe cost
  UPDATE recipes
  SET cost = new_cost, updated_at = now()
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  -- Also update menu item cost if linked
  UPDATE menu_items
  SET cost_price = new_cost, updated_at = now()
  WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS update_recipe_cost_on_ingredient_change ON public.recipe_ingredients;
CREATE TRIGGER update_recipe_cost_on_ingredient_change
  AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_cost_trigger();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_inventory_item_id ON public.recipe_ingredients(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_recipe_id ON public.menu_items(recipe_id);