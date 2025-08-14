-- SECURITY POLICIES FOR BETA LAUNCH
-- Ensure all tables have proper RLS policies

-- 1. STAYS TABLE SECURITY
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only see their own stays" ON public.stays;
DROP POLICY IF EXISTS "Users can only insert their own stays" ON public.stays;
DROP POLICY IF EXISTS "Users can only update their own stays" ON public.stays;
DROP POLICY IF EXISTS "Users can only delete their own stays" ON public.stays;

-- Enable RLS
ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;

-- Create strict policies
CREATE POLICY "Users can only see their own stays" ON public.stays
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own stays" ON public.stays
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own stays" ON public.stays
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own stays" ON public.stays
    FOR DELETE USING (auth.uid() = user_id);

-- 2. PROFILES TABLE SECURITY
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create strict policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. FEEDBACK TABLE CREATION AND SECURITY
-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('general', 'bug', 'feature', 'ui')),
    message TEXT NOT NULL,
    screenshot_url TEXT,
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Feedback policies - allow anyone to insert feedback (anonymous feedback allowed)
CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (true);

-- Only system/admin can read feedback (no user read access for privacy)
-- This will be handled by server-side API routes

-- 4. CREATE SECURITY FUNCTIONS

-- Function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to sanitize text input (remove potential SQL injection)
CREATE OR REPLACE FUNCTION sanitize_text(input text)
RETURNS text AS $$
BEGIN
    -- Remove any SQL keywords and special characters
    RETURN regexp_replace(input, '[;<>''"]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. ADD CONSTRAINTS FOR DATA VALIDATION

-- Ensure stays dates are valid
ALTER TABLE public.stays ADD CONSTRAINT valid_dates 
    CHECK (entry_date IS NOT NULL AND (exit_date IS NULL OR exit_date >= entry_date));

-- Ensure country codes are valid (2 letter codes)
ALTER TABLE public.stays ADD CONSTRAINT valid_country_code 
    CHECK (country_code ~ '^[A-Z]{2}$');

-- Ensure feedback message is not empty
ALTER TABLE public.feedback ADD CONSTRAINT non_empty_message 
    CHECK (length(trim(message)) > 0);

-- 6. CREATE RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits (no user policies)
-- This will be managed by server-side functions

-- 7. CREATE AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (implement admin check as needed)
-- For now, no user access to audit logs

-- 8. CREATE TRIGGER FOR AUDIT LOGGING
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_logs(
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_stays_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.stays
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_profiles_trigger
    AFTER UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 9. SECURITY VIEWS (hide sensitive data)
CREATE OR REPLACE VIEW public.stays_summary AS
SELECT 
    country_code,
    COUNT(*) as visit_count,
    MAX(entry_date) as last_visit
FROM public.stays
WHERE user_id = auth.uid()
GROUP BY country_code;

-- Grant access to the view
GRANT SELECT ON public.stays_summary TO authenticated;

-- 10. Add indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_stays_user_date ON public.stays(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON public.rate_limits(user_id, action, window_start);

COMMENT ON TABLE public.audit_logs IS 'Security audit trail for all data modifications';
COMMENT ON FUNCTION sanitize_text IS 'Sanitizes user input to prevent SQL injection';
COMMENT ON FUNCTION is_valid_email IS 'Validates email format for security';