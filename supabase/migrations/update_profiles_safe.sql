-- Check and add missing columns to profiles table (safe to run multiple times)

-- Add emergency contact fields if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(50);

-- Add preference fields if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_insurance_provider VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_insurance_policy_number VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_days_before_visa_expiry INTEGER DEFAULT 30;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_days_before_passport_expiry INTEGER DEFAULT 180;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();