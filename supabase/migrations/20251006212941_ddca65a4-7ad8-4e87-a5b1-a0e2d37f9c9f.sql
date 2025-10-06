-- Add missing description column to account_categories if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'account_categories' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.account_categories ADD COLUMN description TEXT;
  END IF;
END $$;

-- Insert default account categories if they don't exist
INSERT INTO public.account_categories (account_code, name, type, description) VALUES
  -- Revenue Categories
  ('REV-001', 'Room Revenue', 'revenue', 'Revenue from room bookings'),
  ('REV-002', 'Food & Beverage Revenue', 'revenue', 'Revenue from restaurant and bar sales'),
  ('REV-003', 'Hall Rental Revenue', 'revenue', 'Revenue from hall/event space rentals'),
  ('REV-004', 'Other Revenue', 'revenue', 'Miscellaneous revenue'),
  
  -- Expense Categories
  ('EXP-001', 'Salaries & Wages', 'expense', 'Employee compensation'),
  ('EXP-002', 'Utilities', 'expense', 'Electricity, water, gas, internet'),
  ('EXP-003', 'Food & Beverage Costs', 'expense', 'Cost of ingredients and supplies'),
  ('EXP-004', 'Maintenance & Repairs', 'expense', 'Building and equipment maintenance'),
  ('EXP-005', 'Marketing & Advertising', 'expense', 'Marketing and promotional expenses'),
  ('EXP-006', 'Supplies', 'expense', 'General supplies and inventory'),
  ('EXP-007', 'Other Expenses', 'expense', 'Miscellaneous expenses')
ON CONFLICT (account_code) DO NOTHING;