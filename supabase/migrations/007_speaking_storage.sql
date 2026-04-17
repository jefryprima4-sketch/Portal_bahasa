-- ==========================================
-- PHASE 3: SPEAKING MODULE STORAGE
-- ==========================================

-- 1. Create the Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('speaking-responses', 'speaking-responses', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies for speaking-responses

-- Policy: Students can UPLOAD their own responses
CREATE POLICY "Students can upload speaking responses"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'speaking-responses' AND
  (public.get_my_role() = 'student')
);

-- Policy: Everyone (Authenticated) can READ responses for review
-- Note: In a stricter environment, you would limit this to the 
-- instructor of the course and the student owner.
CREATE POLICY "Users can read speaking responses"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'speaking-responses');

-- Policy: Cleanup (Instructors/Admin can delete)
CREATE POLICY "Instructors can manage speaking responses"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'speaking-responses' AND
  public.get_my_role() IN ('instructor', 'admin')
);
