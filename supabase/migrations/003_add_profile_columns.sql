-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_insurance_provider VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel_insurance_policy_number VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_days_before_visa_expiry INTEGER DEFAULT 30;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_days_before_passport_expiry INTEGER DEFAULT 180;