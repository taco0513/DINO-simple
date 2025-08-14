-- Complete fix for profiles table RLS
-- First, check and enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- Create a single, comprehensive policy for users to manage their own profiles
-- This allows ALL operations (SELECT, INSERT, UPDATE, DELETE) for a user's own profile
CREATE POLICY "Enable all operations for users on their own profiles" ON profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created
SELECT 
    'Policy created successfully' as status,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'profiles';