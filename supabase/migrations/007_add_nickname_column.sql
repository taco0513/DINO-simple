-- Add nickname column to profiles table
-- This allows users to set a display name separate from their account info

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.nickname IS 'User display name/nickname (optional, max 50 characters)';

-- No RLS policy changes needed - existing policies will cover the new column