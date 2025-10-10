# ALOKOLODO HOTELS - Developer Installation & Setup Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Authentication Configuration](#authentication-configuration)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [Mobile App Setup (Capacitor)](#mobile-app-setup-capacitor)
9. [Architecture Overview](#architecture-overview)
10. [Key Features Implementation](#key-features-implementation)
11. [API Documentation](#api-documentation)
12. [Security Implementation](#security-implementation)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)
16. [Contributing](#contributing)

---

## System Overview

ALOKOLODO HOTELS is a comprehensive hotel management system built with modern web technologies.

### Tech Stack

**Frontend**:
- React 18.3.1
- TypeScript
- Vite (Build tool)
- Tailwind CSS
- Shadcn/ui components
- React Router v6
- React Query (TanStack Query)
- Recharts (Analytics)
- Lucide React (Icons)

**Backend**:
- Supabase (PostgreSQL database)
- Supabase Auth (Authentication)
- Row Level Security (RLS)
- Database Functions & Triggers
- Supabase Edge Functions (Serverless)

**Mobile**:
- Capacitor (iOS & Android)
- Native camera & device features

**Additional Libraries**:
- React Hook Form (Form validation)
- Zod (Schema validation)
- date-fns (Date manipulation)
- docx (Document generation)
- xlsx (Excel export)
- Sonner (Toast notifications)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **npm** or **yarn** or **bun**
   ```bash
   npm --version
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **Supabase CLI** (Optional but recommended)
   ```bash
   npm install -g supabase
   ```

### For Mobile Development

5. **Android Studio** (for Android)
   - Download from: https://developer.android.com/studio
   - Install Android SDK
   - Configure Android emulator

6. **Xcode** (for iOS - macOS only)
   - Download from Mac App Store
   - Install iOS Simulator
   - Configure signing certificates

### Required Accounts

- **Supabase Account**: https://supabase.com
- **GitHub Account**: For version control
- **Lovable Account**: https://lovable.dev (if using Lovable platform)

---

## Installation Steps

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/your-org/alokolodo-hotels.git

# Navigate to project directory
cd alokolodo-hotels
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using bun
bun install
```

This will install all dependencies listed in `package.json`:
- Core React libraries
- UI components (Shadcn)
- Supabase client
- Routing and state management
- Form validation
- Charts and visualization
- Mobile capabilities (Capacitor)

### Step 3: Supabase Project Setup

#### Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in details:
   - **Name**: alokolodo-hotels
   - **Database Password**: (Save this securely)
   - **Region**: Choose closest to your users
   - **Plan**: Free or Pro

4. Wait for project to be created (~2 minutes)

#### Get Supabase Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon Public Key**: `eyJhbGciOi...`
   - **Service Role Key**: `eyJhbGciOi...` (Keep secret!)
   - **Project ID**: `[your-project-id]`

### Step 4: Environment Configuration

Create `.env` file in project root:

```bash
# Create .env file
touch .env
```

Add the following configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For local development
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=ALOKOLODO HOTELS
```

**Important**: 
- Never commit `.env` to Git
- `.env` is already in `.gitignore`
- Replace placeholder values with your actual Supabase credentials

---

## Database Setup

### Step 1: Understanding the Schema

The system uses these main tables:
- `profiles` - User profiles and roles
- `user_roles` - Role assignments (security critical)
- `rooms` - Hotel rooms
- `room_bookings` - Room reservations
- `guests` - Guest information
- `menu_items` - Restaurant menu
- `inventory` - Stock management
- `employees` - Staff records
- `payroll_records` - Salary processing
- `suppliers` - Vendor management
- `orders` - POS orders
- `order_items` - Order line items
- And 30+ more tables

### Step 2: Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended for first time)

1. Go to Supabase Dashboard → SQL Editor
2. Open the provided SQL files in order:
   - `COMPLETE_DB_SETUP.sql` - Main database schema
3. Copy contents and run in SQL Editor
4. Verify tables are created in Table Editor

#### Option B: Using Supabase CLI

```bash
# Link your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push

# Or apply specific migration
supabase db reset
```

### Step 3: Set Up Row Level Security (RLS)

RLS policies are included in the SQL migration files. They ensure:
- Users can only access data they're authorized for
- Admins have full access
- Managers can access department data
- Staff can access limited data
- Guests can only see public information

**Critical Security Note**: 
- RLS is ENABLED on all sensitive tables
- Never disable RLS on production
- Test policies thoroughly

### Step 4: Create Database Functions

The system includes 50+ database functions for:
- Role checking: `has_role()`, `has_hr_access()`
- Access control: `can_access_employee_data()`
- Automatic calculations: `update_inventory_quantity()`
- Audit logging: `log_employee_access()`

All functions are created via migration scripts.

### Step 5: Set Up Database Triggers

Triggers handle automatic operations:
- Update `updated_at` timestamps
- Calculate order totals
- Update room status on booking
- Sync inventory with sales
- Log sensitive data access

### Step 6: Initial Data Setup

#### Create First Admin User

1. Go to Authentication → Users
2. Click "Add User"
3. Enter:
   - Email: admin@yourdomain.com
   - Password: (secure password)
4. Confirm email automatically
5. First user gets admin role automatically

#### Add Sample Data (Optional)

For testing, you can add sample data:

```sql
-- Add sample rooms
INSERT INTO rooms (room_number, type, price, status, amenities)
VALUES 
  ('101', 'Single', 100.00, 'available', ARRAY['WiFi', 'TV', 'AC']),
  ('102', 'Double', 150.00, 'available', ARRAY['WiFi', 'TV', 'AC', 'Minibar']),
  ('201', 'Suite', 300.00, 'available', ARRAY['WiFi', 'TV', 'AC', 'Minibar', 'Jacuzzi']);

-- Add sample menu items
INSERT INTO menu_items (name, category, price, is_available)
VALUES
  ('Breakfast Buffet', 'Breakfast', 25.00, true),
  ('Grilled Chicken', 'Main Course', 35.00, true),
  ('Caesar Salad', 'Appetizers', 15.00, true);

-- Add sample inventory
INSERT INTO inventory (item_name, category, current_quantity, unit, cost_per_unit, min_threshold)
VALUES
  ('Rice', 'Food', 100, 'kg', 2.50, 20),
  ('Cooking Oil', 'Food', 50, 'liters', 5.00, 10),
  ('Toilet Paper', 'Supplies', 200, 'rolls', 1.00, 50);
```

---

## Authentication Configuration

### Enable Email Authentication

1. Go to Authentication → Settings
2. Email Auth should be enabled by default
3. Configure:
   - **Email Templates**: Customize welcome emails
   - **Confirm Email**: Enable if you want email verification
   - **Password Requirements**: Set minimum length (12+ recommended)

### Optional: Social Authentication

#### Google OAuth
1. Go to Authentication → Providers
2. Enable Google
3. Configure:
   - Get credentials from Google Cloud Console
   - Add OAuth Client ID
   - Add Client Secret
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

#### Facebook, GitHub, etc.
Similar process for other providers

### Configure Password Policy

Add to Supabase SQL Editor:

```sql
-- Enforce strong passwords (already in schema)
CREATE OR REPLACE FUNCTION validate_strong_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Minimum 12 characters
  IF length(password) < 12 THEN RETURN false; END IF;
  
  -- At least one uppercase
  IF password !~ '[A-Z]' THEN RETURN false; END IF;
  
  -- At least one lowercase
  IF password !~ '[a-z]' THEN RETURN false; END IF;
  
  -- At least one digit
  IF password !~ '[0-9]' THEN RETURN false; END IF;
  
  -- At least one special character
  IF password !~ '[^A-Za-z0-9]' THEN RETURN false; END IF;
  
  RETURN true;
END;
$$;
```

### User Roles Implementation

**Critical Security Pattern**:

```typescript
// ❌ WRONG - Never store roles on profiles table
interface Profile {
  id: string;
  role: string; // DON'T DO THIS - Privilege escalation risk!
}

// ✅ CORRECT - Separate user_roles table
interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'staff';
}
```

The system uses:
- `user_roles` table for role storage
- `app_role` enum for role types
- `has_role()` function for role checking
- Security definer functions to prevent RLS recursion

---

## Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# Or with yarn
yarn dev

# Or with bun
bun dev
```

Application will open at: `http://localhost:5173`

### Development Features

- **Hot Module Replacement (HMR)**: Changes reflect instantly
- **TypeScript**: Type checking in real-time
- **ESLint**: Code quality checks
- **Tailwind CSS**: Instant styling updates

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

Build output goes to `dist/` directory.

### Environment-Specific Configuration

#### Development
```env
VITE_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=https://dev-project.supabase.co
```

#### Staging
```env
VITE_APP_URL=https://staging.alokolodo.com
VITE_SUPABASE_URL=https://staging-project.supabase.co
```

#### Production
```env
VITE_APP_URL=https://alokolodo.com
VITE_SUPABASE_URL=https://prod-project.supabase.co
```

---

## Mobile App Setup (Capacitor)

### Prerequisites for Mobile

- **Android**: Android Studio installed
- **iOS**: Xcode installed (macOS only)
- **Capacitor CLI**: Installed globally

### Initial Capacitor Setup

```bash
# Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Initialize Capacitor
npx cap init
```

When prompted:
- **App Name**: ALOKOLODO HOTELS
- **App ID**: app.lovable.f9b50f76f16a44feae3018a013c97e39
- **Web Directory**: dist

### Configure Capacitor

Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f9b50f76f16a44feae3018a013c97e39',
  appName: 'zenith-room-flow',
  webDir: 'dist',
  server: {
    // For development - hot reload from sandbox
    url: 'https://your-project.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
```

### Add Mobile Platforms

```bash
# Build web assets first
npm run build

# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios

# Sync assets to native projects
npx cap sync
```

### Running on Mobile

#### Android

```bash
# Option 1: Run on emulator/device
npx cap run android

# Option 2: Open in Android Studio
npx cap open android
# Then click Run in Android Studio
```

#### iOS (macOS only)

```bash
# Option 1: Run on simulator/device
npx cap run ios

# Option 2: Open in Xcode
npx cap open ios
# Then click Run in Xcode
```

### Mobile Development Workflow

1. **Make changes** to React code
2. **Build**: `npm run build`
3. **Sync**: `npx cap sync`
4. **Run**: On emulator or device

For faster development:
- Use hot reload with `server.url` in capacitor.config.ts
- Build and sync only when deploying

### Mobile-Specific Features

The app includes mobile detection and mobile-specific UI:

```typescript
// Mobile detection hook
import { useMobile } from '@/hooks/use-mobile';

function Component() {
  const isMobile = useMobile();
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### Platform-Specific Code

```typescript
import { Capacitor } from '@capacitor/core';

const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'
const isNative = Capacitor.isNativePlatform();

if (platform === 'android') {
  // Android-specific code
}
```

---

## Architecture Overview

### Project Structure

```
alokolodo-hotels/
├── public/               # Static assets
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── assets/          # Images, fonts
│   │   └── hero-hotel.jpg
│   ├── components/      # React components
│   │   ├── accounting/  # Accounting module
│   │   ├── auth/        # Authentication
│   │   ├── documentation/
│   │   ├── game/        # Game center
│   │   ├── guest/       # Guest management
│   │   ├── gym/         # Gym management
│   │   ├── hr/          # HR management
│   │   ├── inventory/   # Inventory control
│   │   ├── layout/      # Layout components
│   │   ├── menu/        # Menu management
│   │   ├── mobile/      # Mobile components
│   │   ├── payment/     # Payment processing
│   │   ├── pos/         # POS system
│   │   ├── profile/     # User profiles
│   │   ├── recipe/      # Recipe management
│   │   ├── room/        # Room management
│   │   ├── settings/    # Settings
│   │   ├── supplier/    # Suppliers
│   │   ├── support/     # Support
│   │   └── ui/          # UI components (shadcn)
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.tsx
│   │   └── HotelSettingsContext.tsx
│   ├── hooks/           # Custom hooks
│   │   ├── use-mobile.tsx
│   │   ├── useGuests.ts
│   │   ├── useRooms.ts
│   │   ├── useInventory.ts
│   │   └── [50+ hooks]
│   ├── integrations/    # External integrations
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/             # Utilities
│   │   ├── utils.ts
│   │   └── soundNotifications.ts
│   ├── pages/           # Route pages
│   │   ├── Index.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── GuestManagement.tsx
│   │   └── [40+ pages]
│   ├── utils/           # Helper functions
│   │   ├── themeColors.ts
│   │   ├── dynamicSiteSettings.ts
│   │   └── documentationGenerator.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global styles
│   └── vite-env.d.ts    # Vite types
├── supabase/
│   ├── config.toml      # Supabase config
│   └── migrations/      # Database migrations
├── capacitor.config.ts  # Mobile config
├── tailwind.config.ts   # Tailwind config
├── vite.config.ts       # Vite config
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### Component Architecture

#### Atomic Design Pattern

Components are organized by module:
- **Atoms**: Basic UI components (Button, Input, etc.)
- **Molecules**: Simple combinations (FormField, SearchBar)
- **Organisms**: Complex components (GuestTable, BookingForm)
- **Templates**: Page layouts
- **Pages**: Full pages

#### Component Example

```typescript
// src/components/guest/AddGuestModal.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddGuestModal({ open, onOpenChange, onSuccess }: AddGuestModalProps) {
  const { toast } = useToast();
  
  const handleSubmit = async (data: GuestData) => {
    const { error } = await supabase
      .from('guests')
      .insert(data);
      
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Guest added successfully"
    });
    onSuccess();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Form implementation */}
    </Dialog>
  );
}
```

### State Management

#### React Query (TanStack Query)

Used for server state management:

```typescript
// Custom hook example
export function useGuests() {
  return useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });
}
```

Benefits:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

#### React Context

Used for global app state:

```typescript
// AuthContext
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### Routing

React Router v6 with protected routes:

```typescript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Index />} />
  <Route path="/auth" element={<Auth />} />
  
  {/* Protected routes */}
  <Route path="/admin" element={
    <ProtectedRoute>
      <HotelLayout>
        <AdminDashboard />
      </HotelLayout>
    </ProtectedRoute>
  } />
  
  {/* Role-specific routes */}
  <Route path="/admin/users" element={
    <ProtectedRoute requiredRole="admin">
      <UserManagement />
    </ProtectedRoute>
  } />
</Routes>
```

---

## Key Features Implementation

### 1. Room Booking System

#### Database Tables
- `rooms` - Room inventory
- `room_bookings` - Reservations
- `guests` - Guest profiles

#### Key Functions

```typescript
// Create booking
async function createBooking(bookingData: BookingData) {
  // 1. Check room availability
  const { data: existingBookings } = await supabase
    .from('room_bookings')
    .select('*')
    .eq('room_id', bookingData.room_id)
    .eq('booking_status', 'active')
    .gte('check_out_date', bookingData.check_in_date)
    .lte('check_in_date', bookingData.check_out_date);
  
  if (existingBookings && existingBookings.length > 0) {
    throw new Error('Room not available for these dates');
  }
  
  // 2. Calculate total amount
  const { data: room } = await supabase
    .from('rooms')
    .select('price')
    .eq('id', bookingData.room_id)
    .single();
  
  const nights = differenceInDays(
    bookingData.check_out_date, 
    bookingData.check_in_date
  );
  const totalAmount = room.price * nights;
  
  // 3. Create booking
  const { data, error } = await supabase
    .from('room_bookings')
    .insert({
      ...bookingData,
      nights,
      total_amount: totalAmount,
      booking_status: 'confirmed'
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // 4. Update room status (handled by database trigger)
  
  return data;
}
```

### 2. POS System

#### Order Flow

```typescript
// 1. Create order
const { data: order } = await supabase
  .from('orders')
  .insert({
    guest_name: 'John Doe',
    guest_type: 'walk-in',
    table_id: tableId,
    status: 'active',
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0
  })
  .select()
  .single();

// 2. Add items
for (const item of items) {
  await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      item_name: item.name,
      item_category: item.category,
      quantity: item.quantity,
      price: item.price,
      status: 'pending'
    });
}

// 3. Calculate totals (handled by database trigger)

// 4. Submit to kitchen
await supabase
  .from('kitchen_orders')
  .insert({
    order_id: order.id,
    table_number: table.table_number,
    guest_name: order.guest_name,
    items: items,
    status: 'received'
  });

// 5. Process payment
await supabase
  .from('orders')
  .update({
    status: 'paid',
    payment_method: paymentMethod
  })
  .eq('id', order.id);
```

### 3. Inventory Management

#### Auto-deduction on Sales

```typescript
// Database function (already in schema)
CREATE FUNCTION update_inventory_quantity(item_name text, quantity_change integer)
RETURNS void AS $$
BEGIN
  UPDATE inventory 
  SET current_quantity = GREATEST(0, current_quantity + quantity_change)
  WHERE item_name = item_name_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

// Usage in app
await supabase.rpc('update_inventory_quantity', {
  item_name_param: 'Rice',
  quantity_change: -5  // Negative for usage
});
```

#### Low Stock Alerts

```typescript
// Real-time subscription
const subscription = supabase
  .channel('inventory-alerts')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'inventory',
    filter: 'current_quantity<min_threshold'
  }, (payload) => {
    showNotification({
      title: 'Low Stock Alert',
      message: `${payload.new.item_name} is running low!`,
      type: 'warning'
    });
  })
  .subscribe();
```

### 4. Guest Loyalty Program

#### Automatic Tier Assignment

```typescript
// Database trigger handles this (in migrations)
CREATE TRIGGER handle_booking_guest
AFTER INSERT ON room_bookings
FOR EACH ROW
EXECUTE FUNCTION handle_booking_guest();

// Function calculates:
// - Total bookings count
// - Total amount spent
// - Assigns tier based on thresholds
// - Updates guest record
```

#### Tier Thresholds (Configurable)

```typescript
// Get from settings
const { data: settings } = await supabase
  .from('hotel_settings')
  .select('loyalty_*')
  .single();

const tiers = {
  bronze: settings.loyalty_bronze_threshold,  // $0
  silver: settings.loyalty_silver_threshold,  // $2000
  gold: settings.loyalty_gold_threshold,      // $5000
  platinum: settings.loyalty_platinum_threshold // $10000
};
```

### 5. HR & Payroll

#### Payroll Processing

```typescript
async function processPayroll(payPeriod: PayPeriod) {
  // 1. Get active employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*, employee_loans(*)')
    .eq('status', 'active');
  
  // 2. Calculate for each employee
  for (const employee of employees) {
    const baseSalary = employee.salary;
    const overtimeHours = await getOvertimeHours(employee.id, payPeriod);
    const overtimePay = overtimeHours * (baseSalary / 160) * 1.5;
    
    // Calculate deductions
    const taxDeduction = baseSalary * 0.15; // 15% tax
    const loanDeduction = employee.employee_loans?.[0]?.monthly_deduction || 0;
    
    const grossPay = baseSalary + overtimePay;
    const totalDeductions = taxDeduction + loanDeduction;
    const netPay = grossPay - totalDeductions;
    
    // 3. Create payroll record
    await supabase
      .from('payroll_records')
      .insert({
        employee_id: employee.id,
        pay_period_start: payPeriod.start,
        pay_period_end: payPeriod.end,
        base_salary: baseSalary,
        overtime_hours: overtimeHours,
        overtime_rate: (baseSalary / 160) * 1.5,
        tax_deduction: taxDeduction,
        loan_deduction: loanDeduction,
        gross_pay: grossPay,
        net_pay: netPay,
        status: 'processed',
        processed_at: new Date(),
        processed_by: userId
      });
    
    // 4. Update loan balance if applicable
    if (loanDeduction > 0) {
      await supabase
        .from('employee_loans')
        .update({
          remaining_amount: employee.employee_loans[0].remaining_amount - loanDeduction
        })
        .eq('id', employee.employee_loans[0].id);
    }
  }
}
```

### 6. Reporting & Analytics

#### Revenue Analytics

```typescript
async function getRevenueAnalytics(startDate: Date, endDate: Date) {
  // Room revenue
  const { data: roomRevenue } = await supabase
    .from('room_bookings')
    .select('total_amount, check_in_date')
    .gte('check_in_date', startDate)
    .lte('check_in_date', endDate)
    .eq('payment_status', 'paid');
  
  // Restaurant revenue
  const { data: restaurantRevenue } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'paid');
  
  // Calculate totals
  const totalRoomRevenue = roomRevenue?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
  const totalRestaurantRevenue = restaurantRevenue?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
  
  return {
    rooms: totalRoomRevenue,
    restaurant: totalRestaurantRevenue,
    total: totalRoomRevenue + totalRestaurantRevenue,
    breakdown: {
      byDate: generateDailyBreakdown(roomRevenue, restaurantRevenue),
      bySource: {
        rooms: (totalRoomRevenue / (totalRoomRevenue + totalRestaurantRevenue)) * 100,
        restaurant: (totalRestaurantRevenue / (totalRoomRevenue + totalRestaurantRevenue)) * 100
      }
    }
  };
}
```

---

## API Documentation

### Supabase Client Usage

```typescript
import { supabase } from '@/integrations/supabase/client';

// SELECT
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value')
  .order('created_at', { ascending: false });

// INSERT
const { data, error } = await supabase
  .from('table_name')
  .insert({ column: 'value' })
  .select();

// UPDATE
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', id);

// DELETE
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id);

// RPC (Call database function)
const { data, error } = await supabase
  .rpc('function_name', {
    param1: 'value1',
    param2: 'value2'
  });
```

### Real-time Subscriptions

```typescript
// Subscribe to table changes
const subscription = supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: '*',  // INSERT, UPDATE, DELETE, or *
    schema: 'public',
    table: 'table_name'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

### Authentication API

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign out
const { error } = await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Get user
const { data: { user } } = await supabase.auth.getUser();
```

---

## Security Implementation

### Row Level Security (RLS)

#### Understanding RLS

RLS ensures data security at the database level:
- Policies define who can access what data
- Enforced on every query
- Cannot be bypassed from client
- Independent of application code

#### Example Policies

```sql
-- Guests table - Staff can view all, guests can't access
CREATE POLICY "Staff can view all guests"
ON guests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'staff', 'front_desk')
  )
);

-- Room bookings - Staff can manage, guests can view their own
CREATE POLICY "Guests can view their own bookings"
ON room_bookings FOR SELECT
TO authenticated
USING (guest_email = auth.jwt() ->> 'email');

CREATE POLICY "Staff can manage all bookings"
ON room_bookings FOR ALL
TO authenticated
USING (has_hotel_staff_access());
```

#### Role-Based Access Control (RBAC)

```typescript
// Check user role
async function checkUserRole(requiredRole: AppRole): Promise<boolean> {
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  return userRoles?.some(r => r.role === requiredRole) || false;
}

// Use in component
function AdminOnlyComponent() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    checkUserRole('admin').then(setHasAccess);
  }, [user]);
  
  if (!hasAccess) return <AccessDenied />;
  
  return <AdminPanel />;
}
```

### Sensitive Data Protection

#### Field-Level Security

```sql
-- Create views for different access levels
CREATE VIEW employee_basic_info AS
SELECT id, employee_id, first_name, last_name, email, phone, department_id
FROM employees;

CREATE VIEW employee_sensitive_info AS
SELECT id, employee_id, first_name, last_name, salary, bank_account, national_id
FROM employees;

-- Grant access based on role
GRANT SELECT ON employee_basic_info TO authenticated;
GRANT SELECT ON employee_sensitive_info TO admin, hr;
```

#### Audit Logging

```sql
-- Log sensitive data access
CREATE TABLE employee_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  accessed_by UUID REFERENCES auth.users(id),
  access_type TEXT NOT NULL,
  accessed_fields TEXT[],
  access_time TIMESTAMPTZ DEFAULT now()
);

-- Trigger to log access
CREATE TRIGGER log_employee_access
AFTER SELECT ON employees
FOR EACH ROW
EXECUTE FUNCTION log_employee_access();
```

### Input Validation

```typescript
// Zod schema for validation
import { z } from 'zod';

const guestSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  id_number: z.string().optional()
});

// Use in form
const form = useForm({
  resolver: zodResolver(guestSchema),
  defaultValues: {
    name: '',
    email: '',
    phone: ''
  }
});
```

### SQL Injection Prevention

**✅ SAFE** - Using Supabase client (parameterized queries):
```typescript
const { data } = await supabase
  .from('guests')
  .select('*')
  .eq('email', userInput);  // Safe - parameterized
```

**❌ UNSAFE** - Raw SQL with concatenation:
```typescript
// Never do this!
const query = `SELECT * FROM guests WHERE email = '${userInput}'`;
```

### XSS Prevention

```typescript
// React automatically escapes content
<div>{userInput}</div>  // Safe

// Dangerous HTML rendering
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // Unsafe!

// Safe HTML rendering with sanitization
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## Testing

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Example Test

```typescript
// src/components/guest/AddGuestModal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddGuestModal } from './AddGuestModal';

describe('AddGuestModal', () => {
  it('renders form fields', () => {
    render(
      <AddGuestModal 
        open={true} 
        onOpenChange={vi.fn()} 
        onSuccess={vi.fn()} 
      />
    );
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    const onSuccess = vi.fn();
    render(
      <AddGuestModal 
        open={true} 
        onOpenChange={vi.fn()} 
        onSuccess={onSuccess} 
      />
    );
    
    const submitButton = screen.getByText('Add Guest');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// Test with Supabase
import { createClient } from '@supabase/supabase-js';

// Use test database
const supabaseTest = createClient(
  'https://test-project.supabase.co',
  'test-anon-key'
);

describe('Guest Management Integration', () => {
  beforeEach(async () => {
    // Clean test data
    await supabaseTest.from('guests').delete().neq('id', '');
  });
  
  it('creates guest and retrieves it', async () => {
    // Create guest
    const { data: newGuest } = await supabaseTest
      .from('guests')
      .insert({ name: 'Test Guest', email: 'test@example.com' })
      .select()
      .single();
    
    expect(newGuest).toBeDefined();
    
    // Retrieve guest
    const { data: retrievedGuest } = await supabaseTest
      .from('guests')
      .select('*')
      .eq('id', newGuest.id)
      .single();
    
    expect(retrievedGuest.name).toBe('Test Guest');
  });
});
```

---

## Deployment

### Deploying to Lovable

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Lovable**:
   - Go to Lovable dashboard
   - Connect GitHub repository
   - Lovable auto-deploys from main branch

3. **Configure Environment**:
   - Add environment variables in Lovable dashboard
   - Set production Supabase credentials

4. **Custom Domain**:
   - Go to Lovable → Settings → Domains
   - Add your domain
   - Configure DNS records

### Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Deploying to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_APP_URL=https://yourdomain.com
```

### Mobile App Deployment

#### Android (Google Play)

1. **Build Release APK**:
   ```bash
   npm run build
   npx cap sync
   cd android
   ./gradlew assembleRelease
   ```

2. **Sign APK**:
   - Generate keystore
   - Configure signing in build.gradle
   - Build signed APK

3. **Upload to Play Console**:
   - Create app in Play Console
   - Upload APK/AAB
   - Fill store listing
   - Submit for review

#### iOS (App Store)

1. **Build for Release**:
   ```bash
   npm run build
   npx cap sync
   npx cap open ios
   ```

2. **In Xcode**:
   - Select "Any iOS Device"
   - Product → Archive
   - Distribute App
   - Upload to App Store

3. **App Store Connect**:
   - Create app
   - Upload build
   - Fill app information
   - Submit for review

---

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Error

**Error**: "Invalid API key" or "Network error"

**Solutions**:
- Verify `.env` file exists with correct credentials
- Check Supabase project status
- Ensure anon key is correct (not service role key)
- Check internet connection

#### 2. RLS Policy Blocking Queries

**Error**: "row-level security policy violation"

**Solutions**:
- Check user is authenticated
- Verify user role is correct
- Review RLS policies for table
- Ensure policies match your use case
- Check `auth.uid()` is accessible in policy

**Debug**:
```sql
-- Test policy
SELECT * FROM table_name;
-- If fails, check:
SELECT auth.uid();  -- Should return user ID
SELECT has_role(auth.uid(), 'admin');  -- Should return true/false
```

#### 3. TypeScript Errors

**Error**: "Property does not exist on type"

**Solutions**:
- Run `npx supabase gen types typescript` to regenerate types
- Check import paths are correct
- Ensure `types.ts` is up to date with database schema
- Restart TypeScript server in IDE

#### 4. Build Failures

**Error**: Build fails with module errors

**Solutions**:
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Clear Vite cache
rm -rf .vite

# Rebuild
npm run build
```

#### 5. Mobile App Not Loading

**Error**: White screen or "Cannot connect"

**Solutions**:
- Check `capacitor.config.ts` has correct app ID
- Verify `dist` folder has build files
- Run `npx cap sync` after any web changes
- Check mobile logs:
  - Android: `adb logcat`
  - iOS: Xcode console
- Ensure server.url is set for development

#### 6. Authentication Issues

**Error**: User can't login or session expires

**Solutions**:
- Check email is confirmed (if required)
- Verify password meets requirements
- Check session timeout in Supabase settings
- Clear browser cookies/storage
- Check auth provider is enabled

### Development Tips

1. **Use React DevTools**:
   - Install React DevTools extension
   - Inspect component tree
   - Monitor state changes

2. **Use Supabase Studio**:
   - View real-time data
   - Test RLS policies
   - Check function logs

3. **Enable Source Maps**:
   ```typescript
   // vite.config.ts
   export default {
     build: {
       sourcemap: true
     }
   };
   ```

4. **Debug Network Requests**:
   - Open browser DevTools
   - Network tab
   - Filter by "supabase"
   - Check request/response

### Performance Optimization

1. **Lazy Loading**:
   ```typescript
   const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
   
   <Suspense fallback={<Loading />}>
     <AdminDashboard />
   </Suspense>
   ```

2. **Memoization**:
   ```typescript
   const expensiveCalculation = useMemo(() => {
     return calculateTotal(data);
   }, [data]);
   ```

3. **Database Indexes**:
   ```sql
   CREATE INDEX idx_bookings_dates 
   ON room_bookings(check_in_date, check_out_date);
   ```

4. **Image Optimization**:
   - Use WebP format
   - Compress images
   - Lazy load images
   - Use CDN

---

## Contributing

### Development Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/guest-search
   ```

2. **Make Changes**:
   - Write code
   - Add tests
   - Update documentation

3. **Commit**:
   ```bash
   git add .
   git commit -m "feat: add guest search functionality"
   ```

4. **Push**:
   ```bash
   git push origin feature/guest-search
   ```

5. **Create Pull Request**:
   - Go to GitHub
   - Create PR from feature branch
   - Request review
   - Address feedback

### Commit Message Convention

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructure
- `test:` Tests
- `chore:` Maintenance

Examples:
```
feat: add guest loyalty tier badges
fix: resolve booking date overlap issue
docs: update installation guide
refactor: simplify inventory calculation logic
```

### Code Style

Follow project conventions:
- Use TypeScript
- Use functional components
- Use hooks, not classes
- Follow ESLint rules
- Use Prettier for formatting

```bash
# Format code
npm run format

# Lint code
npm run lint
```

---

## Additional Resources

### Documentation Links

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vitejs.dev
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn/ui**: https://ui.shadcn.com
- **React Query**: https://tanstack.com/query
- **Capacitor**: https://capacitorjs.com/docs

### Video Tutorials

- Lovable YouTube: https://www.youtube.com/@lovabledev
- Supabase YouTube: https://www.youtube.com/@Supabase

### Community

- Lovable Discord: https://discord.gg/lovable
- Supabase Discord: https://discord.supabase.com

### Support

For issues or questions:
- GitHub Issues: Create an issue in the repository
- Email: support@yourdomain.com
- Documentation: Check this guide first

---

## License

[Your License Here]

---

## Credits

Developed by [Your Team/Company]

Built with ❤️ using Lovable, React, and Supabase

---

**Happy Coding! 🚀**
