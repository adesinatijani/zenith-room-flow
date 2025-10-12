-- =====================================================
-- COMPLETE ACCOUNTING MODULE SQL SETUP
-- Paste this entire file into Owen's Supabase SQL Editor
-- =====================================================

-- 1. CREATE ACCOUNT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.account_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_category_id UUID REFERENCES public.account_categories(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CREATE ACCOUNT ENTRIES TABLE (Journal Entries)
CREATE TABLE IF NOT EXISTS public.account_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES public.account_categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  debit_amount NUMERIC(15,2) DEFAULT 0 CHECK (debit_amount >= 0),
  credit_amount NUMERIC(15,2) DEFAULT 0 CHECK (credit_amount >= 0),
  reference_number TEXT,
  entry_type TEXT DEFAULT 'manual' CHECK (entry_type IN ('manual', 'automatic', 'adjustment', 'closing')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
  posted_by UUID REFERENCES auth.users(id),
  posted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_entry_amounts CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR 
    (credit_amount > 0 AND debit_amount = 0)
  )
);

-- 3. CREATE BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.account_categories(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_number INTEGER,
  budgeted_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(15,2) DEFAULT 0,
  variance NUMERIC(15,2),
  variance_percentage NUMERIC(5,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_account_entries_entry_date ON public.account_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_account_entries_category_id ON public.account_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_account_entries_status ON public.account_entries(status);
CREATE INDEX IF NOT EXISTS idx_account_categories_type ON public.account_categories(account_type);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_fiscal_year ON public.budgets(fiscal_year);

-- 5. CREATE UPDATE TIMESTAMP TRIGGER FUNCTION (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
DROP TRIGGER IF EXISTS update_account_categories_updated_at ON public.account_categories;
CREATE TRIGGER update_account_categories_updated_at
  BEFORE UPDATE ON public.account_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_entries_updated_at ON public.account_entries;
CREATE TRIGGER update_account_entries_updated_at
  BEFORE UPDATE ON public.account_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. CREATE HELPER FUNCTION FOR FINANCIAL ACCESS
CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'accounting', 'hr');
END;
$$;

-- 8. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES FOR ACCOUNT_CATEGORIES
DROP POLICY IF EXISTS "Only financial staff can view account categories" ON public.account_categories;
CREATE POLICY "Only financial staff can view account categories"
  ON public.account_categories FOR SELECT
  USING (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can insert account categories" ON public.account_categories;
CREATE POLICY "Only financial staff can insert account categories"
  ON public.account_categories FOR INSERT
  WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can update account categories" ON public.account_categories;
CREATE POLICY "Only financial staff can update account categories"
  ON public.account_categories FOR UPDATE
  USING (has_financial_access())
  WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only admins can delete account categories" ON public.account_categories;
CREATE POLICY "Only admins can delete account categories"
  ON public.account_categories FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 10. CREATE RLS POLICIES FOR ACCOUNT_ENTRIES
DROP POLICY IF EXISTS "Only financial staff can view account entries" ON public.account_entries;
CREATE POLICY "Only financial staff can view account entries"
  ON public.account_entries FOR SELECT
  USING (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can insert account entries" ON public.account_entries;
CREATE POLICY "Only financial staff can insert account entries"
  ON public.account_entries FOR INSERT
  WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can update account entries" ON public.account_entries;
CREATE POLICY "Only financial staff can update account entries"
  ON public.account_entries FOR UPDATE
  USING (has_financial_access())
  WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only admins can delete account entries" ON public.account_entries;
CREATE POLICY "Only admins can delete account entries"
  ON public.account_entries FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 11. CREATE RLS POLICIES FOR BUDGETS
DROP POLICY IF EXISTS "Only financial staff can view budgets" ON public.budgets;
CREATE POLICY "Only financial staff can view budgets"
  ON public.budgets FOR SELECT
  USING (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can insert budgets" ON public.budgets;
CREATE POLICY "Only financial staff can insert budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can update budgets" ON public.budgets;
CREATE POLICY "Only financial staff can update budgets"
  ON public.budgets FOR UPDATE
  USING (has_financial_access())
  WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only admins can delete budgets" ON public.budgets;
CREATE POLICY "Only admins can delete budgets"
  ON public.budgets FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 12. INSERT DEFAULT ACCOUNT CATEGORIES
INSERT INTO public.account_categories (account_code, account_name, account_type, description) VALUES
  ('1000', 'Cash', 'asset', 'Cash and cash equivalents'),
  ('1100', 'Accounts Receivable', 'asset', 'Money owed by customers'),
  ('1200', 'Inventory', 'asset', 'Goods held for sale'),
  ('1500', 'Fixed Assets', 'asset', 'Property, plant, and equipment'),
  ('2000', 'Accounts Payable', 'liability', 'Money owed to suppliers'),
  ('2100', 'Short-term Loans', 'liability', 'Loans due within one year'),
  ('2500', 'Long-term Debt', 'liability', 'Loans due after one year'),
  ('3000', 'Owner Equity', 'equity', 'Owner''s investment in the business'),
  ('3100', 'Retained Earnings', 'equity', 'Cumulative profits retained'),
  ('4000', 'Room Revenue', 'revenue', 'Revenue from room bookings'),
  ('4100', 'Restaurant Revenue', 'revenue', 'Revenue from restaurant sales'),
  ('4200', 'Bar Revenue', 'revenue', 'Revenue from bar sales'),
  ('4300', 'Other Revenue', 'revenue', 'Other income sources'),
  ('5000', 'Cost of Goods Sold', 'expense', 'Direct costs of goods sold'),
  ('5100', 'Salaries & Wages', 'expense', 'Employee compensation'),
  ('5200', 'Utilities', 'expense', 'Electricity, water, gas'),
  ('5300', 'Rent', 'expense', 'Property rental costs'),
  ('5400', 'Marketing', 'expense', 'Advertising and promotion'),
  ('5500', 'Maintenance', 'expense', 'Repairs and maintenance'),
  ('5600', 'Office Supplies', 'expense', 'Office consumables'),
  ('5700', 'Insurance', 'expense', 'Insurance premiums'),
  ('5800', 'Depreciation', 'expense', 'Asset depreciation')
ON CONFLICT (account_code) DO NOTHING;

-- 13. CREATE VIEW FOR FINANCIAL SUMMARY
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
  COALESCE(SUM(CASE WHEN ac.account_type = 'revenue' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN ac.account_type = 'expense' THEN ae.debit_amount - ae.credit_amount ELSE 0 END), 0) as total_expenses,
  COALESCE(SUM(CASE WHEN ac.account_type = 'asset' THEN ae.debit_amount - ae.credit_amount ELSE 0 END), 0) as total_assets,
  COALESCE(SUM(CASE WHEN ac.account_type = 'liability' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0) as total_liabilities,
  COALESCE(SUM(CASE WHEN ac.account_type = 'equity' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0) as total_equity,
  COALESCE(SUM(CASE WHEN ac.account_type = 'revenue' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN ac.account_type = 'expense' THEN ae.debit_amount - ae.credit_amount ELSE 0 END), 0) as net_income
FROM public.account_entries ae
LEFT JOIN public.account_categories ac ON ae.category_id = ac.id
WHERE ae.status = 'posted';

-- =====================================================
-- SETUP COMPLETE!
-- 
-- Next Steps:
-- 1. Make sure you have a 'profiles' table with a 'role' column
-- 2. Ensure roles include: 'admin', 'manager', 'accounting', 'hr'
-- 3. Test by logging in as an admin user
-- 4. Create your first journal entry!
-- =====================================================
