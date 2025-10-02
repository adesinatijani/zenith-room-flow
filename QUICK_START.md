# Quick Start Guide

## 📋 Installation in 5 Minutes

### Step 1: Copy SQL Script
Copy the entire `COMPLETE_DB_SETUP.sql` file

### Step 2: Run in Supabase
1. Go to your Supabase project
2. Open SQL Editor
3. Paste the SQL script
4. Click "Run"
5. Wait ~60 seconds for completion

### Step 3: Create Admin User
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. First user becomes admin automatically

### Step 4: Configure Environment
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 5: Launch App
```bash
npm install
npm run dev
```

## ✅ Verification

Run this query to verify:
```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies;
```

Expected: ~30 tables, ~80 policies

## 🔐 Default Roles

- **admin**: Full access to everything
- **manager**: Manage operations, view reports
- **hr**: Employee management, payroll
- **accounting**: Financial records, budgets
- **staff**: Basic operations
- **front_desk**: Room bookings, guest management
- **housekeeping**: Room status
- **kitchen**: Kitchen orders, menu
- **procurement**: Inventory, suppliers

## 🎯 First Steps After Installation

1. ✅ Login with admin account
2. ✅ Go to Settings → Configure hotel info
3. ✅ HR Management → Add departments
4. ✅ HR Management → Add positions  
5. ✅ User Management → Invite team members
6. ✅ Room Management → Add rooms
7. ✅ Inventory → Add items
8. ✅ Supplier Management → Add suppliers

## 🆘 Quick Troubleshooting

**Can't login?**
```sql
-- Manually verify email
UPDATE auth.users SET email_confirmed_at = now() 
WHERE email = 'your_email@example.com';
```

**Not an admin?**
```sql
-- Set admin role
UPDATE public.profiles SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your_email@example.com');
```

**Missing tables?**
- Re-run the complete SQL setup script
- Check for error messages in SQL Editor

## 📚 Full Documentation

See `INSTALLATION_GUIDE.md` for detailed instructions.

## 🔒 Security Features Included

✅ Row Level Security (RLS) on all tables
✅ Field-level data masking for sensitive info
✅ Audit logging for employee data access
✅ Role-based access control
✅ Secure functions with SECURITY DEFINER
✅ First user auto-promoted to admin
✅ Password encryption via Supabase Auth

## 🚀 Production Checklist

Before going live:
- [ ] Enable email confirmations
- [ ] Set strong password requirements (12+ chars)
- [ ] Configure custom domain
- [ ] Enable rate limiting
- [ ] Set up backups
- [ ] Configure SMTP for emails
- [ ] Add reCAPTCHA
- [ ] Review all RLS policies
- [ ] Test all major workflows
- [ ] Train staff on the system
