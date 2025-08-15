-- Fix audit trigger to handle TEXT IDs from stays table
-- The stays table uses TEXT for id, but audit_logs expects UUID for record_id

-- Drop the existing trigger
DROP TRIGGER IF EXISTS audit_stays_trigger ON public.stays;

-- Create a new trigger function that handles TEXT IDs
CREATE OR REPLACE FUNCTION audit_trigger_function_text_id()
RETURNS trigger AS $$
BEGIN
    -- For stays table, convert TEXT id to UUID if possible, otherwise use NULL
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
        CASE 
            WHEN TG_TABLE_NAME = 'stays' THEN 
                CASE 
                    WHEN COALESCE(NEW.id, OLD.id) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                    THEN COALESCE(NEW.id, OLD.id)::UUID
                    ELSE NULL
                END
            ELSE COALESCE(NEW.id, OLD.id)::UUID
        END,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create the trigger with the new function
CREATE TRIGGER audit_stays_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.stays
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function_text_id();

-- Alternative solution: Just disable audit logging for stays table temporarily
-- DROP TRIGGER IF EXISTS audit_stays_trigger ON public.stays;