-- Fix financial data security by implementing role-based RLS policies
-- This addresses the "Company Financial Records Could Be Stolen" security issue

-- Define who can access financial data (accounting staff, managers, and admins)
CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'accounting', 'hr');
END;
$$;

-- ACCOUNT_ENTRIES TABLE
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on account_entries" ON public.account_entries;

-- Create restrictive policies for account_entries
CREATE POLICY "Only financial staff can view account entries" 
ON public.account_entries 
FOR SELECT 
TO authenticated
USING (public.has_financial_access());

CREATE POLICY "Only financial staff can insert account entries" 
ON public.account_entries 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only financial staff can update account entries" 
ON public.account_entries 
FOR UPDATE 
TO authenticated
USING (public.has_financial_access())
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only admins can delete account entries" 
ON public.account_entries 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- BUDGETS TABLE
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on budgets" ON public.budgets;

-- Create restrictive policies for budgets
CREATE POLICY "Only financial staff can view budgets" 
ON public.budgets 
FOR SELECT 
TO authenticated
USING (public.has_financial_access());

CREATE POLICY "Only financial staff can insert budgets" 
ON public.budgets 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only financial staff can update budgets" 
ON public.budgets 
FOR UPDATE 
TO authenticated
USING (public.has_financial_access())
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only admins can delete budgets" 
ON public.budgets 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- FINANCIAL_REPORTS TABLE
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on financial_reports" ON public.financial_reports;

-- Create restrictive policies for financial_reports
CREATE POLICY "Only financial staff can view financial reports" 
ON public.financial_reports 
FOR SELECT 
TO authenticated
USING (public.has_financial_access());

CREATE POLICY "Only financial staff can generate financial reports" 
ON public.financial_reports 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only financial staff can update financial reports" 
ON public.financial_reports 
FOR UPDATE 
TO authenticated
USING (public.has_financial_access())
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only admins can delete financial reports" 
ON public.financial_reports 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ACCOUNT_CATEGORIES TABLE (also financial data)
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on account_categories" ON public.account_categories;

-- Create restrictive policies for account_categories
CREATE POLICY "Only financial staff can view account categories" 
ON public.account_categories 
FOR SELECT 
TO authenticated
USING (public.has_financial_access());

CREATE POLICY "Only financial staff can manage account categories" 
ON public.account_categories 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only financial staff can update account categories" 
ON public.account_categories 
FOR UPDATE 
TO authenticated
USING (public.has_financial_access())
WITH CHECK (public.has_financial_access());

CREATE POLICY "Only admins can delete account categories" 
ON public.account_categories 
FOR DELETE 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');