-- Add manual grading columns to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS is_manually_graded BOOLEAN DEFAULT FALSE;

-- Update RLS policies (if any specific ones are needed)
-- Instructors can update submissions for their own courses
-- (Assuming public.get_my_role() is available)
CREATE POLICY "Instructors can grade submissions"
ON public.submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON q.course_id = c.id
    WHERE q.id = public.submissions.quiz_id
    AND (c.instructor_id = auth.uid() OR public.get_my_role() = 'admin')
  )
);
