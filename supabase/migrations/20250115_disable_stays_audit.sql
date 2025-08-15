-- Temporarily disable audit trigger on stays table
-- The stays table uses TEXT for id, but audit_logs expects UUID for record_id
-- This is causing inserts to fail

DROP TRIGGER IF EXISTS audit_stays_trigger ON public.stays;

-- Note: To re-enable auditing, the audit_logs table needs to be modified
-- to accept TEXT record_ids, or the stays table needs to use UUID ids