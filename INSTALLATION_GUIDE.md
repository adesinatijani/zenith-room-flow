# Hotel Management System - Complete Installation Guide

## Prerequisites
- A Supabase account (free or paid tier)
- Access to Supabase SQL Editor
- Basic understanding of PostgreSQL

## Installation Steps

### Step 1: Create a New Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name, database password, and region
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### Step 2: Run the Database Setup Script

1. Navigate to your project in Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `COMPLETE_DB_SETUP.sql` (see below)
5. Paste into the SQL Editor
6. Click "Run" or press Ctrl/Cmd + Enter
7. Wait for execution to complete (~30-60 seconds)

### Step 3: Verify Installation

Run this verification query:
```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as function_count,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policy_count;
```

Expected results:
- Tables: ~30+
- Functions: ~30+
- Policies: ~80+

### Step 4: Create First Admin User

1. In Supabase Dashboard, go to "Authentication" → "Users"
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Click "Create user"
5. **Important:** The first user created will automatically become admin

### Step 5: Configure Authentication Settings

1. Go to "Authentication" → "Providers"
2. Enable Email provider (should be enabled by default)
3. Optional: Enable other providers (Google, etc.)
4. Go to "Authentication" → "URL Configuration"
5. Add your site URL to "Site URL" field
6. Add your site URL to "Redirect URLs" field

### Step 6: Get Your Project Credentials

1. Go to "Settings" → "API"
2. Copy the following:
   - Project URL
   - Project API keys (anon/public key)
3. Update your `.env` file:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 7: Test the Application

1. Start your application: `npm run dev`
2. Navigate to `/auth` page
3. Sign in with the admin account you created
4. You should be redirected to the dashboard

## Post-Installation Configuration

### Security Enhancements

1. **Enable Email Confirmations** (recommended for production)
   - Go to "Authentication" → "Providers" → "Email"
   - Enable "Confirm email"

2. **Configure Password Requirements**
   - Go to "Authentication" → "Providers" → "Email"
   - Set minimum password length (12+ recommended)

3. **Enable MFA** (optional)
   - Go to "Authentication" → "Providers"
   - Enable "Phone" or "TOTP"

### Initial Data Setup

After installation, you should:

1. **Add Departments**: Go to HR Management → Departments
2. **Add Positions**: Go to HR Management → Positions
3. **Add Room Types**: Go to Room Management
4. **Add Inventory Categories**: Go to Inventory Management
5. **Configure Hotel Settings**: Go to Settings

## Troubleshooting

### Common Issues

**Issue: "relation does not exist" error**
- Solution: Make sure you ran the complete SQL setup script
- Verify: Check table list in SQL Editor

**Issue: "permission denied" errors**
- Solution: Re-run the RLS policies section of the setup script
- Verify: Check that policies exist for each table

**Issue: Can't login after creating user**
- Solution: Check that the email is confirmed in Auth → Users
- Manually verify the email if needed

**Issue: First user is not admin**
- Solution: Run this SQL to manually set admin role:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your_email@example.com');
```

## Database Backup

### Create Backup
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or export from Supabase Dashboard
# Go to Settings → Database → Connection string
# Use pg_dump with the connection string
```

### Restore Backup
```bash
# Using Supabase CLI
supabase db reset --db-url "your_connection_string"
psql "your_connection_string" < backup.sql
```

## Migration to Production

1. Create a new Supabase project for production
2. Run the same installation steps
3. Copy environment variables to production
4. Enable additional security features:
   - Rate limiting
   - Email confirmations
   - CAPTCHA
   - Custom domains

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Review the application README.md
- Contact your development team

## Next Steps

After successful installation:
1. ✅ Customize hotel settings
2. ✅ Add your team members
3. ✅ Configure room types and rates
4. ✅ Set up inventory categories
5. ✅ Configure payment gateways
6. ✅ Test all major workflows
