# Complete Setup Instructions for Owen's Dashboard

## Overview
This guide provides all the SQL code needed to set up the complete accounting module with daily reporting for Owen's hotel management system.

## Setup Order (IMPORTANT - Follow in this exact order!)

### Step 1: Run the Accounting Module Setup
**File: `ACCOUNTING_MODULE_COMPLETE_SQL.sql`**

This creates:
- ✅ Account categories table (asset, liability, equity, revenue, expense)
- ✅ Account entries table (journal entries)
- ✅ Budgets table
- ✅ All necessary indexes for performance
- ✅ Row-Level Security (RLS) policies
- ✅ Default account categories (22 pre-configured accounts)
- ✅ Financial summary view

**Action:** Copy the entire contents of `ACCOUNTING_MODULE_COMPLETE_SQL.sql` and paste into your Supabase SQL Editor, then run it.

---

### Step 2: Run the Daily Reporting System Setup
**File: `DAILY_REPORTING_SYSTEM.sql`**

This creates:
- ✅ Daily summaries table (stores historical snapshots)
- ✅ Automatic snapshot generation at midnight (00:05 daily)
- ✅ Functions to generate daily summaries
- ✅ Comparison views between days
- ✅ Historical data for the last 30 days (optional backfill)

**Action:** Copy the entire contents of `DAILY_REPORTING_SYSTEM.sql` and paste into your Supabase SQL Editor, then run it.

---

## Key Features After Setup

### 1. Accounting Module
- **Dashboard:** Real-time financial summary with revenue, expenses, net income, assets, liabilities, equity
- **Sales Report:** Detailed breakdown of all revenue sources
- **Journal Entries:** Complete general ledger with debit/credit entries
- **Budget Management:** Track budgets vs actual spending
- **Financial Reports:** Generate custom date-range reports

### 2. Daily Reporting System
- **Automatic Snapshots:** System automatically saves data at 00:05 every night
- **Historical Data:** Query any previous day's performance
- **Yesterday's Report:** Available in accounting module and admin dashboard
- **30-Day Backfill:** Optional - uncomment section 9 in `DAILY_REPORTING_SYSTEM.sql` to generate last 30 days

### 3. Clear Sales Feature
The "Clear All Sales" button in Admin Dashboard now:
- ✅ Clears all paid orders
- ✅ Clears all order items
- ✅ Clears all paid gym/game sessions
- ✅ Marks room bookings as cancelled
- ✅ **Clears all accounting journal entries**
- ✅ Resets everything to zero

---

## Manual Operations

### Generate a Summary for a Specific Date
```sql
SELECT public.generate_daily_summary('2025-01-15');
```

### View Daily Comparisons (Last 7 Days)
```sql
SELECT * FROM public.daily_comparison LIMIT 7;
```

### View Historical Summaries (Last 30 Days)
```sql
SELECT * FROM public.daily_summaries 
ORDER BY summary_date DESC 
LIMIT 30;
```

### Backfill Historical Data (Last 30 Days)
Uncomment section 9 in `DAILY_REPORTING_SYSTEM.sql` or run:
```sql
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..30 LOOP
    PERFORM public.generate_daily_summary(CURRENT_DATE - (i || ' days')::INTERVAL);
  END LOOP;
END $$;
```

---

## Required User Roles
Make sure your `profiles` table has users with these roles:
- `admin` - Full access to everything
- `manager` - Can view and manage most features
- `accounting` - Can access accounting module
- `hr` - Can access HR and accounting features

---

## Troubleshooting

### Error: "relation daily_summaries does not exist"
**Solution:** You need to run `DAILY_REPORTING_SYSTEM.sql` first

### Error: "relation account_entries does not exist"
**Solution:** You need to run `ACCOUNTING_MODULE_COMPLETE_SQL.sql` first

### Error: "permission denied for table"
**Solution:** Make sure your user has the correct role (admin, manager, accounting, or hr)

### No data in daily_summaries
**Solution:** Wait until after midnight, or manually generate summaries using:
```sql
SELECT public.generate_daily_summary(CURRENT_DATE - INTERVAL '1 day');
```

### Cron job not running
**Solution:** Check if `pg_cron` extension is enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

If not listed, run:
```sql
CREATE EXTENSION pg_cron;
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Daily Operations                  │
│  (Room bookings, Orders, Gym sessions, etc.)        │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│              Real-Time Dashboard                     │
│     Shows TODAY's data (live, updates every min)    │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓ (At 00:05 daily)
┌─────────────────────────────────────────────────────┐
│           Auto-Generate Daily Summary                │
│         (Cron job: generate_daily_summary)          │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│            Daily Summaries Table                     │
│    Stores historical data for each day              │
│    (Revenue, expenses, bookings, etc.)              │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│          Accounting Module & Reports                 │
│   - View yesterday's performance                     │
│   - Compare day-to-day changes                       │
│   - Generate historical reports                      │
└─────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Important Tables
- `account_categories` - Chart of accounts
- `account_entries` - All journal entries
- `budgets` - Budget tracking
- `daily_summaries` - Historical daily snapshots

### Important Functions
- `has_financial_access()` - Checks user permissions
- `generate_daily_summary(date)` - Creates snapshot for a date
- `auto_generate_yesterday_summary()` - Auto-run at midnight

### Important Views
- `financial_summary` - Current financial position
- `daily_comparison` - Compare today vs yesterday

---

## Support
If you encounter any issues:
1. Check that both SQL files have been run in order
2. Verify your user has the correct role
3. Check Supabase logs for detailed error messages
4. Ensure `pg_cron` extension is enabled

---

**Last Updated:** 2025-01-12
**Version:** 1.0
