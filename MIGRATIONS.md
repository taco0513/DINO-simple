# Database Migrations Guide

This guide explains how to properly set up and run database migrations for DINO.

## Quick Setup

Run these migrations in your Supabase SQL Editor in order:

1. **001_create_stays_table.sql** - Creates the main travel records table
2. **002_create_profiles_table.sql** - Creates user profiles with basic fields
3. **003_add_profile_columns.sql** - Adds preferences and insurance fields
4. **004_fix_profiles_rls.sql** - Fixes Row Level Security policies
5. **005_fix_profiles_complete.sql** - Comprehensive RLS fix (run if 004 fails)
6. **Disable audit logs RLS**: `ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;`

## Migration Details

### 001_create_stays_table.sql
- Creates the `stays` table for tracking travel records
- Includes: entry/exit dates, country, visa type, notes
- Sets up RLS policies for user data protection

### 002_create_profiles_table.sql
- Creates the `profiles` table with basic passport information
- Fields: passport_nationality, issue_date, expiry_date
- Enables RLS with basic SELECT policy

### 003_add_profile_columns.sql
- Adds user preference fields:
  - preferred_currency
  - travel_insurance_provider
  - travel_insurance_policy_number
  - notification_days_before_visa_expiry
  - notification_days_before_passport_expiry

### 004_fix_profiles_rls.sql
- Adds missing INSERT, UPDATE, DELETE policies
- Fixes permission issues when saving profiles
- Run this if you get "row-level security policy" errors

### 005_fix_profiles_complete.sql
- Complete RLS fix using a single comprehensive policy
- Use this if migration 004 doesn't resolve issues
- Enables all operations (SELECT, INSERT, UPDATE, DELETE) for users on their own profiles

### Audit Logs Fix
If you get errors mentioning "audit_logs", run:
```sql
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

## Common Issues

### "new row violates row-level security policy for table 'profiles'"
**Solution**: Run migration 004 or 005 to add proper RLS policies

### "new row violates row-level security policy for table 'audit_logs'"
**Solution**: Disable RLS on audit_logs table (see above)

### "column does not exist" errors
**Solution**: Run migration 003 to add missing columns

## Verification

After running migrations, verify with:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('stays', 'profiles');

-- Check active RLS policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

## Production Notes

- Always backup your database before running migrations
- Test migrations in a development environment first
- Run migrations during low-traffic periods
- Monitor application logs after migration for any issues