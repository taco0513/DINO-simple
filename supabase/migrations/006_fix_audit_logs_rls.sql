-- Fix RLS for audit_logs table if it exists
DO $$
BEGIN
    -- Check if audit_logs table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Enable RLS on audit_logs
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        
        -- Drop any existing policies
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON audit_logs;
        DROP POLICY IF EXISTS "Enable read for users based on user_id" ON audit_logs;
        
        -- Create policy to allow authenticated users to insert audit logs
        CREATE POLICY "Enable insert for authenticated users" ON audit_logs
            FOR INSERT
            WITH CHECK (auth.role() = 'authenticated');
            
        -- Create policy to allow users to read their own audit logs
        CREATE POLICY "Enable read for users based on user_id" ON audit_logs
            FOR SELECT
            USING (auth.uid()::text = user_id OR auth.uid()::text = (payload->>'user_id')::text);
            
        RAISE NOTICE 'Audit logs RLS policies created successfully';
    ELSE
        RAISE NOTICE 'audit_logs table does not exist, skipping...';
    END IF;
END $$;

-- Alternative: If audit logs are causing issues and aren't needed, disable RLS on that table
-- ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;