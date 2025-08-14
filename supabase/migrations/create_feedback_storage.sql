-- Create feedback-screenshots storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-screenshots', 'feedback-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for feedback screenshots
-- Allow authenticated users to upload their own feedback screenshots
CREATE POLICY "Users can upload feedback screenshots" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'feedback-screenshots');

-- Allow public read access to feedback screenshots (for email attachments)
CREATE POLICY "Public read access for feedback screenshots" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'feedback-screenshots');

-- Allow system/admin to delete old feedback screenshots
CREATE POLICY "Admin can delete feedback screenshots" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'feedback-screenshots');