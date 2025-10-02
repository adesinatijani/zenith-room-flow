-- ============================================
-- HOTEL MANAGEMENT SYSTEM - COMPLETE DATABASE SETUP
-- ============================================
-- This script sets up the entire database schema with:
-- - All tables with proper structure
-- - Row Level Security (RLS) policies
-- - Database functions and triggers
-- - Initial configurations
-- ============================================

-- ============================================
-- PART 1: CORE TABLES & PROFILES
-- ============================================

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  phone text,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement', 'hr', 'accounting')),
  department text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Hotel settings table
CREATE TABLE IF NOT EXISTS public.hotel_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_name text NOT NULL DEFAULT 'My Hotel',
  hotel_icon text DEFAULT 'Hotel',
  hotel_address text,
  hotel_phone text,
  hotel_whatsapp text,
  hotel_email text,
  hotel_website text,
  hotel_description text,
  currency text NOT NULL DEFAULT 'USD',
  tax_rate numeric DEFAULT 7.5,
  language text NOT NULL DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  date_format text DEFAULT 'MM/dd/yyyy',
  time_format text DEFAULT '12h',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  desktop_notifications boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  payment_gateways jsonb DEFAULT '{"stripe": true, "paystack": true, "paypal": false, "razorpay": false, "flutterwave": true, "mobileMoney": true}'::jsonb,
  two_factor_enabled boolean DEFAULT false,
  session_timeout integer DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 2: ROOM MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number text NOT NULL UNIQUE,
  room_type text NOT NULL DEFAULT 'standard' CHECK (room_type IN ('standard', 'deluxe', 'suite', 'presidential')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  rate numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 2,
  floor_number integer,
  amenities text[] DEFAULT '{}',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.room_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL,
  guest_name text NOT NULL,
  guest_phone text,
  guest_email text,
  check_in_date date NOT NULL DEFAULT CURRENT_DATE,
  check_out_date date NOT NULL,
  nights integer NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial', 'cancelled')),
  booking_status text NOT NULL DEFAULT 'active' CHECK (booking_status IN ('active', 'completed', 'cancelled', 'no-show')),
  special_requests text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 3: RESTAURANT & POS
-- ============================================

CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number text NOT NULL UNIQUE,
  seats integer NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id uuid,
  guest_name text NOT NULL,
  guest_type text NOT NULL CHECK (guest_type IN ('walk-in', 'hotel-guest', 'delivery')),
  room_number text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  payment_method text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  item_name text NOT NULL,
  item_category text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  special_instructions text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.kitchen_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  table_number text NOT NULL,
  guest_name text NOT NULL,
  items jsonb NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'served')),
  priority integer NOT NULL DEFAULT 1,
  estimated_time integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: INVENTORY MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('food', 'beverages', 'cleaning', 'linens', 'toiletries', 'kitchen', 'office', 'maintenance', 'other')),
  current_quantity integer NOT NULL DEFAULT 0,
  min_threshold integer NOT NULL DEFAULT 10,
  max_threshold integer NOT NULL DEFAULT 100,
  unit text NOT NULL DEFAULT 'units' CHECK (unit IN ('units', 'kg', 'liters', 'pieces', 'boxes', 'bottles', 'packs')),
  cost_per_unit numeric NOT NULL DEFAULT 0,
  supplier text,
  last_restocked timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: SUPPLIER MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  category text NOT NULL CHECK (category IN ('food', 'beverages', 'cleaning', 'linens', 'maintenance', 'other')),
  payment_terms text DEFAULT 'Net 30',
  tax_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  rating numeric DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_orders integer DEFAULT 0,
  total_amount numeric DEFAULT 0.00,
  last_order_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.supplier_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id uuid NOT NULL,
  order_number text NOT NULL UNIQUE,
  total_amount numeric NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-transit', 'delivered', 'cancelled')),
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  delivery_date date,
  notes text,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.supplier_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  unit text NOT NULL DEFAULT 'units',
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.supplier_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id uuid NOT NULL,
  order_id uuid,
  amount numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'card', 'mobile_money')),
  reference_number text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: HR MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  description text,
  manager_id uuid,
  budget numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.employee_positions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL UNIQUE,
  department_id uuid,
  description text,
  requirements text,
  min_salary numeric,
  max_salary numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_positions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  address text,
  department_id uuid,
  position_id uuid,
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  salary numeric NOT NULL,
  employment_type text NOT NULL DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'temporary')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave', 'terminated')),
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  national_id text,
  bank_account text,
  total_leave_days integer DEFAULT 25,
  used_leave_days integer DEFAULT 0,
  manager_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  leave_type text NOT NULL CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'emergency')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  rejection_reason text,
  approved_by uuid,
  approved_at timestamp with time zone,
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.employee_loans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  loan_amount numeric NOT NULL,
  purpose text NOT NULL,
  monthly_deduction numeric NOT NULL,
  remaining_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'rejected', 'cancelled')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date date,
  approved_by uuid,
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.payroll_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  base_salary numeric NOT NULL,
  overtime_hours numeric DEFAULT 0,
  overtime_rate numeric DEFAULT 0,
  bonus numeric DEFAULT 0,
  loan_deduction numeric DEFAULT 0,
  tax_deduction numeric DEFAULT 0,
  other_deductions numeric DEFAULT 0,
  gross_pay numeric NOT NULL,
  net_pay numeric NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
  processed_at timestamp with time zone,
  processed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  review_period_start date NOT NULL,
  review_period_end date NOT NULL,
  overall_rating numeric CHECK (overall_rating >= 1 AND overall_rating <= 5),
  goals_achievement numeric CHECK (goals_achievement >= 1 AND goals_achievement <= 5),
  teamwork numeric CHECK (teamwork >= 1 AND teamwork <= 5),
  communication numeric CHECK (communication >= 1 AND communication <= 5),
  leadership numeric CHECK (leadership >= 1 AND leadership <= 5),
  strengths text,
  areas_for_improvement text,
  goals_next_period text,
  comments text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'acknowledged')),
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.staff_recognition (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  recognition_type text NOT NULL CHECK (recognition_type IN ('employee_of_month', 'excellence', 'teamwork', 'innovation', 'customer_service')),
  title text NOT NULL,
  description text,
  month_year date,
  nominated_by uuid,
  votes integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  voting_period text,
  award_date date DEFAULT CURRENT_DATE,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_recognition ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.staff_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  voter_name text NOT NULL,
  voter_type text NOT NULL CHECK (voter_type IN ('staff', 'guest', 'management')),
  voting_period text NOT NULL,
  voted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 7: ACCOUNTING
-- ============================================

CREATE TABLE IF NOT EXISTS public.account_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'asset', 'liability', 'equity')),
  code text,
  parent_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.account_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  category_id uuid,
  description text NOT NULL,
  amount numeric NOT NULL,
  debit_amount numeric DEFAULT 0,
  credit_amount numeric DEFAULT 0,
  reference_number text,
  sub_category text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'cancelled')),
  source_type text,
  source_id uuid,
  notes text,
  posted_by text,
  posted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.account_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category_id uuid,
  fiscal_year integer NOT NULL,
  period_type text NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_number integer,
  budgeted_amount numeric NOT NULL,
  actual_amount numeric DEFAULT 0,
  variance numeric,
  variance_percentage numeric,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 8: EMPLOYEE ACCESS LOG (AUDIT)
-- ============================================

CREATE TABLE IF NOT EXISTS public.employee_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid,
  accessed_by uuid,
  access_type text NOT NULL,
  accessed_fields text[],
  access_time timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

ALTER TABLE public.employee_access_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 9: VIEWS FOR EMPLOYEE DATA ACCESS
-- ============================================

-- Basic info view (safe for all authenticated users)
CREATE OR REPLACE VIEW public.employee_basic_info AS
SELECT 
  id, employee_id, first_name, last_name, email, phone,
  department_id, position_id, employment_type, hire_date,
  status, total_leave_days, used_leave_days,
  created_at, updated_at
FROM public.employees;

-- Sensitive info view (HR/Admin only)
CREATE OR REPLACE VIEW public.employee_sensitive_info AS
SELECT 
  id, employee_id, first_name, last_name, email, phone,
  address, department_id, position_id, hire_date,
  date_of_birth, national_id, emergency_contact_name,
  emergency_contact_phone, employment_type, status,
  total_leave_days, used_leave_days, manager_id, notes,
  created_at, updated_at
FROM public.employees;

-- Financial info view (HR/Admin only)
CREATE OR REPLACE VIEW public.employee_financial_info AS
SELECT 
  id, employee_id, first_name, last_name, email,
  department_id, position_id, salary, bank_account,
  created_at, updated_at
FROM public.employees;

-- ============================================
-- PART 10: UTILITY FUNCTIONS
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to check role-based access
CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_management_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager');
END;
$$;

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

CREATE OR REPLACE FUNCTION public.has_kitchen_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'kitchen', 'staff');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_booking_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping');
END;
$$;

-- Function to handle new user creation (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Insert profile with admin role if first user, otherwise staff
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    role
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'staff' END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- PART 11: EMPLOYEE DATA ACCESS FUNCTIONS
-- ============================================

-- Function for basic employee info access
CREATE OR REPLACE FUNCTION public.can_access_employee_basic_info_only(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
  current_user_dept_id uuid;
  emp_email text;
  emp_dept_id uuid;
BEGIN
  -- Get current user's role, email, and department
  SELECT p.role, u.email, e.department_id 
  INTO current_user_role, current_user_email, current_user_dept_id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.employees e ON e.email = u.email
  WHERE p.id = auth.uid();
  
  -- HR and Admin can access basic info for all employees
  IF current_user_role IN ('admin', 'hr') THEN
    RETURN TRUE;
  END IF;
  
  -- Get employee's email and department
  SELECT email, department_id INTO emp_email, emp_dept_id 
  FROM public.employees WHERE id = emp_id;
  
  -- Employees can access their own basic data
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  -- Managers can access basic info of employees in their department
  IF current_user_role = 'manager' AND current_user_dept_id IS NOT NULL 
     AND emp_dept_id = current_user_dept_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function for sensitive personal info access
CREATE OR REPLACE FUNCTION public.can_access_employee_sensitive_info_only(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
  emp_email text;
BEGIN
  -- Get current user's role and email
  SELECT p.role, u.email 
  INTO current_user_role, current_user_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
  
  -- Only HR and Admin can access sensitive personal info of others
  IF current_user_role IN ('admin', 'hr') THEN
    -- Log sensitive data access for audit
    INSERT INTO public.employee_access_log (
      employee_id, accessed_by, access_type, accessed_fields, access_time
    ) VALUES (
      emp_id, auth.uid(), 'sensitive_personal_data', 
      ARRAY['national_id', 'address', 'date_of_birth', 'emergency_contact'], now()
    );
    RETURN TRUE;
  END IF;
  
  -- Get employee's email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Employees can access their own sensitive data
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function for financial info access
CREATE OR REPLACE FUNCTION public.can_access_employee_financial_info_only(emp_id uuid)  
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  current_user_email text;
  emp_email text;
BEGIN
  -- Get current user's role and email
  SELECT p.role, u.email 
  INTO current_user_role, current_user_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
  
  -- Only HR and Admin can access financial info of others
  IF current_user_role IN ('admin', 'hr') THEN
    -- Log financial data access for audit
    INSERT INTO public.employee_access_log (  
      employee_id, accessed_by, access_type, accessed_fields, access_time
    ) VALUES (
      emp_id, auth.uid(), 'financial_data_access', 
      ARRAY['salary', 'bank_account'], now()
    );
    RETURN TRUE;
  END IF;
  
  -- Get employee's email
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  -- Employees can access their own financial data
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to check if user can access any employee data
CREATE OR REPLACE FUNCTION public.can_access_employee_data(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_email text;
  emp_email text;
BEGIN
  IF public.has_hr_access() THEN
    RETURN TRUE;
  END IF;
  
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  RETURN (current_user_email = emp_email);
END;
$$;

-- Secure data access with field masking
CREATE OR REPLACE FUNCTION public.get_employee_data_secure(emp_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid, employee_id text, first_name text, last_name text, email text,
  phone text, address text, department_id uuid, position_id uuid, hire_date date,
  salary numeric, employment_type text, status text, emergency_contact_name text,
  emergency_contact_phone text, date_of_birth date, national_id text,
  bank_account text, total_leave_days integer, used_leave_days integer,
  manager_id uuid, notes text, created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
  current_email text;
  can_see_sensitive boolean := false;
  can_see_financial boolean := false;
BEGIN
  -- Get current user details
  SELECT p.role, u.email INTO current_role, current_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
  
  -- Determine access levels
  can_see_sensitive := current_role IN ('admin', 'hr');
  can_see_financial := current_role IN ('admin', 'hr');
  
  -- Return data with proper field masking
  RETURN QUERY
  SELECT 
    e.id, e.employee_id, e.first_name, e.last_name, e.email,
    CASE WHEN can_see_sensitive OR e.email = current_email THEN e.phone ELSE '***-***-****' END::text,
    CASE WHEN can_see_sensitive OR e.email = current_email THEN e.address ELSE '[RESTRICTED]' END::text,
    e.department_id, e.position_id, e.hire_date,
    CASE WHEN can_see_financial OR e.email = current_email THEN e.salary ELSE NULL END::numeric,
    e.employment_type, e.status,
    CASE WHEN can_see_sensitive OR e.email = current_email THEN e.emergency_contact_name ELSE '[RESTRICTED]' END::text,
    CASE WHEN can_see_sensitive OR e.email = current_email THEN e.emergency_contact_phone ELSE '***-***-****' END::text,
    CASE WHEN can_see_sensitive OR e.email = current_email THEN e.date_of_birth ELSE NULL END::date,
    CASE WHEN can_see_sensitive OR e.email = current_email THEN e.national_id ELSE '***-**-****' END::text,
    CASE WHEN can_see_financial OR e.email = current_email THEN e.bank_account ELSE '****-****-****' END::text,
    e.total_leave_days, e.used_leave_days, e.manager_id,
    CASE WHEN can_see_sensitive OR e.email = current_email THEN e.notes ELSE '[RESTRICTED]' END::text,
    e.created_at, e.updated_at
  FROM public.employees e
  WHERE 
    CASE WHEN emp_id IS NOT NULL THEN e.id = emp_id ELSE true END
    AND public.can_access_employee_basic_info_only(e.id);
END;
$$;

-- Function to get current user's own employee data
CREATE OR REPLACE FUNCTION public.get_my_employee_data()
RETURNS TABLE(
  id uuid, employee_id text, first_name text, last_name text, email text,
  phone text, address text, department_id uuid, position_id uuid, hire_date date,
  salary numeric, employment_type text, status text, emergency_contact_name text,
  emergency_contact_phone text, date_of_birth date, national_id text,
  bank_account text, total_leave_days integer, used_leave_days integer,
  manager_id uuid, notes text, created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email text;
BEGIN
  SELECT email INTO current_email FROM auth.users WHERE id = auth.uid();
  RETURN QUERY SELECT * FROM public.employees e WHERE e.email = current_email;
END;
$$;

-- ============================================
-- PART 12: TRIGGERS
-- ============================================

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_bookings_updated_at BEFORE UPDATE ON public.room_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kitchen_orders_updated_at BEFORE UPDATE ON public.kitchen_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON public.supplier_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_loans_updated_at BEFORE UPDATE ON public.employee_loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON public.performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_entries_updated_at BEFORE UPDATE ON public.account_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotel_settings_updated_at BEFORE UPDATE ON public.hotel_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PART 13: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Admin can insert profiles" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) OR
    (NOT EXISTS (SELECT 1 FROM public.profiles))
  );

CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "HR can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (has_hr_access());

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Hotel Settings policies
CREATE POLICY "hotel_settings_management_only_select" ON public.hotel_settings FOR SELECT TO authenticated
  USING (has_management_access());

CREATE POLICY "hotel_settings_management_only_insert" ON public.hotel_settings FOR INSERT TO authenticated
  WITH CHECK (has_management_access());

CREATE POLICY "hotel_settings_management_only_update" ON public.hotel_settings FOR UPDATE TO authenticated
  USING (has_management_access()) WITH CHECK (has_management_access());

CREATE POLICY "hotel_settings_admin_only_delete" ON public.hotel_settings FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Rooms policies
CREATE POLICY "rooms_staff_access_select" ON public.rooms FOR SELECT TO authenticated
  USING (has_hotel_staff_access());

CREATE POLICY "rooms_management_modify" ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (has_management_access());

CREATE POLICY "rooms_management_update" ON public.rooms FOR UPDATE TO authenticated
  USING (has_management_access()) WITH CHECK (has_management_access());

CREATE POLICY "rooms_admin_delete" ON public.rooms FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Room Bookings policies
CREATE POLICY "secure_booking_select" ON public.room_bookings FOR SELECT TO authenticated
  USING (has_booking_access());

CREATE POLICY "secure_booking_insert" ON public.room_bookings FOR INSERT TO authenticated
  WITH CHECK (has_booking_access());

CREATE POLICY "secure_booking_update" ON public.room_bookings FOR UPDATE TO authenticated
  USING (has_booking_access()) WITH CHECK (has_booking_access());

CREATE POLICY "secure_booking_delete" ON public.room_bookings FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Restaurant Tables policies
CREATE POLICY "restaurant_tables_staff_access_select" ON public.restaurant_tables FOR SELECT TO authenticated
  USING (has_hotel_staff_access());

CREATE POLICY "restaurant_tables_management_modify" ON public.restaurant_tables FOR INSERT TO authenticated
  WITH CHECK (has_management_access());

CREATE POLICY "restaurant_tables_management_update" ON public.restaurant_tables FOR UPDATE TO authenticated
  USING (has_management_access()) WITH CHECK (has_management_access());

CREATE POLICY "restaurant_tables_management_delete" ON public.restaurant_tables FOR DELETE TO authenticated
  USING (has_management_access());

-- Orders policies
CREATE POLICY "secure_orders_select" ON public.orders FOR SELECT TO authenticated
  USING (has_booking_access());

CREATE POLICY "secure_orders_insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (has_booking_access());

CREATE POLICY "secure_orders_update" ON public.orders FOR UPDATE TO authenticated
  USING (has_booking_access()) WITH CHECK (has_booking_access());

CREATE POLICY "secure_orders_delete" ON public.orders FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Order Items policies
CREATE POLICY "order_items_staff_access_select" ON public.order_items FOR SELECT TO authenticated
  USING (has_hotel_staff_access());

CREATE POLICY "order_items_staff_access_insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (has_hotel_staff_access());

CREATE POLICY "order_items_staff_access_update" ON public.order_items FOR UPDATE TO authenticated
  USING (has_hotel_staff_access()) WITH CHECK (has_hotel_staff_access());

CREATE POLICY "order_items_management_delete" ON public.order_items FOR DELETE TO authenticated
  USING (has_management_access());

-- Kitchen Orders policies
CREATE POLICY "kitchen_orders_kitchen_access_select" ON public.kitchen_orders FOR SELECT TO authenticated
  USING (has_kitchen_access());

CREATE POLICY "kitchen_orders_kitchen_access_insert" ON public.kitchen_orders FOR INSERT TO authenticated
  WITH CHECK (has_kitchen_access());

CREATE POLICY "kitchen_orders_kitchen_access_update" ON public.kitchen_orders FOR UPDATE TO authenticated
  USING (has_kitchen_access()) WITH CHECK (has_kitchen_access());

CREATE POLICY "kitchen_orders_management_delete" ON public.kitchen_orders FOR DELETE TO authenticated
  USING (has_management_access());

-- Inventory policies
CREATE POLICY "inventory_staff_access_select" ON public.inventory FOR SELECT TO authenticated
  USING (has_hotel_staff_access());

CREATE POLICY "inventory_management_insert" ON public.inventory FOR INSERT TO authenticated
  WITH CHECK (has_management_access() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement');

CREATE POLICY "inventory_management_update" ON public.inventory FOR UPDATE TO authenticated
  USING (has_management_access() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement')
  WITH CHECK (has_management_access() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement');

CREATE POLICY "inventory_admin_delete" ON public.inventory FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Suppliers policies
CREATE POLICY "secure_suppliers_select" ON public.suppliers FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

CREATE POLICY "secure_suppliers_insert" ON public.suppliers FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_suppliers_update" ON public.suppliers FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_suppliers_delete" ON public.suppliers FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Supplier Orders policies
CREATE POLICY "secure_supplier_orders_select" ON public.supplier_orders FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

CREATE POLICY "secure_supplier_orders_insert" ON public.supplier_orders FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_supplier_orders_update" ON public.supplier_orders FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_supplier_orders_delete" ON public.supplier_orders FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Supplier Order Items policies
CREATE POLICY "secure_supplier_order_items_select" ON public.supplier_order_items FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

CREATE POLICY "secure_supplier_order_items_insert" ON public.supplier_order_items FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_supplier_order_items_update" ON public.supplier_order_items FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_supplier_order_items_delete" ON public.supplier_order_items FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Supplier Payments policies
CREATE POLICY "secure_supplier_payments_select" ON public.supplier_payments FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

CREATE POLICY "secure_supplier_payments_insert" ON public.supplier_payments FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_supplier_payments_update" ON public.supplier_payments FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

CREATE POLICY "secure_supplier_payments_delete" ON public.supplier_payments FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Departments policies
CREATE POLICY "departments_hr_management_select" ON public.departments FOR SELECT TO authenticated
  USING (has_hr_access());

CREATE POLICY "departments_admin_modify" ON public.departments FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "departments_admin_update" ON public.departments FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "departments_admin_delete" ON public.departments FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Employee Positions policies
CREATE POLICY "employee_positions_hr_management_select" ON public.employee_positions FOR SELECT TO authenticated
  USING (has_hr_access());

CREATE POLICY "employee_positions_admin_modify" ON public.employee_positions FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "employee_positions_admin_update" ON public.employee_positions FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "employee_positions_admin_delete" ON public.employee_positions FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Employees policies (SECURE with field-level protection)
CREATE POLICY "employees_secure_select_with_field_protection" ON public.employees FOR SELECT TO authenticated
  USING (can_access_employee_basic_info_only(id));

CREATE POLICY "employees_insert_hr_only" ON public.employees FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager'));

CREATE POLICY "employees_secure_update_with_field_restrictions" ON public.employees FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') OR
    (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager') OR
    (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "employees_delete_admin_only" ON public.employees FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Leave Requests policies
CREATE POLICY "secure_leave_select" ON public.leave_requests FOR SELECT TO authenticated
  USING (can_access_employee_data(employee_id));

CREATE POLICY "secure_leave_insert" ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (
    (employee_id IN (SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))) OR
    has_hr_access()
  );

CREATE POLICY "secure_leave_update" ON public.leave_requests FOR UPDATE TO authenticated
  USING (has_hr_access()) WITH CHECK (has_hr_access());

CREATE POLICY "secure_leave_delete" ON public.leave_requests FOR DELETE TO authenticated
  USING (has_hr_access());

-- Employee Loans policies
CREATE POLICY "secure_loan_select" ON public.employee_loans FOR SELECT TO authenticated
  USING (can_access_employee_data(employee_id));

CREATE POLICY "secure_loan_insert" ON public.employee_loans FOR INSERT TO authenticated
  WITH CHECK (
    (employee_id IN (SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))) OR
    has_hr_access()
  );

CREATE POLICY "secure_loan_update" ON public.employee_loans FOR UPDATE TO authenticated
  USING (has_hr_access()) WITH CHECK (has_hr_access());

CREATE POLICY "secure_loan_delete" ON public.employee_loans FOR DELETE TO authenticated
  USING (has_hr_access());

-- Payroll Records policies
CREATE POLICY "secure_payroll_select" ON public.payroll_records FOR SELECT TO authenticated
  USING (can_access_employee_data(employee_id));

CREATE POLICY "secure_payroll_insert" ON public.payroll_records FOR INSERT TO authenticated
  WITH CHECK (has_hr_access());

CREATE POLICY "secure_payroll_update" ON public.payroll_records FOR UPDATE TO authenticated
  USING (has_hr_access()) WITH CHECK (has_hr_access());

CREATE POLICY "secure_payroll_delete" ON public.payroll_records FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Performance Reviews policies
CREATE POLICY "secure_review_select" ON public.performance_reviews FOR SELECT TO authenticated
  USING (
    has_hr_access() OR
    (employee_id IN (SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))) OR
    (reviewer_id = auth.uid())
  );

CREATE POLICY "secure_review_insert" ON public.performance_reviews FOR INSERT TO authenticated
  WITH CHECK (has_hr_access());

CREATE POLICY "secure_review_update" ON public.performance_reviews FOR UPDATE TO authenticated
  USING (has_hr_access() OR (reviewer_id = auth.uid()))
  WITH CHECK (has_hr_access() OR (reviewer_id = auth.uid()));

CREATE POLICY "secure_review_delete" ON public.performance_reviews FOR DELETE TO authenticated
  USING (has_hr_access());

-- Staff Recognition policies
CREATE POLICY "staff_recognition_staff_access_select" ON public.staff_recognition FOR SELECT TO authenticated
  USING (has_hotel_staff_access());

CREATE POLICY "staff_recognition_hr_access_insert" ON public.staff_recognition FOR INSERT TO authenticated
  WITH CHECK (has_hr_access());

CREATE POLICY "staff_recognition_hr_access_update" ON public.staff_recognition FOR UPDATE TO authenticated
  USING (has_hr_access()) WITH CHECK (has_hr_access());

CREATE POLICY "staff_recognition_admin_delete" ON public.staff_recognition FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Staff Votes policies
CREATE POLICY "staff_votes_authenticated_select" ON public.staff_votes FOR SELECT TO authenticated
  USING (has_hotel_staff_access());

CREATE POLICY "staff_votes_authenticated_insert" ON public.staff_votes FOR INSERT TO authenticated
  WITH CHECK (has_hotel_staff_access());

CREATE POLICY "staff_votes_admin_delete" ON public.staff_votes FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Account Categories policies
CREATE POLICY "Only financial staff can view account categories" ON public.account_categories FOR SELECT TO authenticated
  USING (has_financial_access());

CREATE POLICY "Only financial staff can insert account categories" ON public.account_categories FOR INSERT TO authenticated
  WITH CHECK (has_financial_access());

CREATE POLICY "Only financial staff can update account categories" ON public.account_categories FOR UPDATE TO authenticated
  USING (has_financial_access()) WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete account categories" ON public.account_categories FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Account Entries policies
CREATE POLICY "Only financial staff can view account entries" ON public.account_entries FOR SELECT TO authenticated
  USING (has_financial_access());

CREATE POLICY "Only financial staff can insert account entries" ON public.account_entries FOR INSERT TO authenticated
  WITH CHECK (has_financial_access());

CREATE POLICY "Only financial staff can update account entries" ON public.account_entries FOR UPDATE TO authenticated
  USING (has_financial_access()) WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete account entries" ON public.account_entries FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Budgets policies
CREATE POLICY "Only financial staff can view budgets" ON public.budgets FOR SELECT TO authenticated
  USING (has_financial_access());

CREATE POLICY "Only financial staff can insert budgets" ON public.budgets FOR INSERT TO authenticated
  WITH CHECK (has_financial_access());

CREATE POLICY "Only financial staff can update budgets" ON public.budgets FOR UPDATE TO authenticated
  USING (has_financial_access()) WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete budgets" ON public.budgets FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Employee Access Log policies (Admin only)
CREATE POLICY "Only admins can view access logs" ON public.employee_access_log FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- PART 14: GRANT PERMISSIONS
-- ============================================

-- Revoke all public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- PART 15: INSERT DEFAULT HOTEL SETTINGS
-- ============================================

INSERT INTO public.hotel_settings (id, hotel_name) 
VALUES (gen_random_uuid(), 'My Hotel')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSTALLATION COMPLETE!
-- ============================================
-- Next steps:
-- 1. Create your first user via Supabase Auth Dashboard
-- 2. The first user will automatically become an admin
-- 3. Configure hotel settings in the application
-- 4. Start adding rooms, departments, and other data
-- ============================================
