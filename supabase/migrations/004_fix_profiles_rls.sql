-- Fix RLS policies for profiles table
-- Drop ALL existing policies first (including any with different names)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Create comprehensive RLS policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own profile (optional)
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = user_id);