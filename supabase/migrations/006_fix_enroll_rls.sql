-- ==========================================
-- FIX: PERIZINAN PENDAFTARAN (ENROLLMENT)
-- ==========================================
DROP POLICY IF EXISTS "enroll_insert_admin" ON public.course_enroll;
CREATE POLICY "enroll_insert_student_or_admin" ON public.course_enroll 
  FOR INSERT WITH CHECK (
    auth.uid() = student_id 
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "enroll_select_all_authorized" ON public.course_enroll;
CREATE POLICY "enroll_select_authorized" ON public.course_enroll
  FOR SELECT USING (
    auth.uid() = student_id 
    OR public.is_instructor_or_admin()
  );

-- ==========================================
-- FIX: PERIZINAN SUBMISSION (PENGIRIMAN KUIS)
-- ==========================================
DROP POLICY IF EXISTS "submissions_insert_self" ON public.submissions;
CREATE POLICY "submissions_insert_self" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "submissions_select_authorized" ON public.submissions;
CREATE POLICY "submissions_select_authorized" ON public.submissions
  FOR SELECT USING (
    auth.uid() = student_id 
    OR public.is_instructor_or_admin()
  );

-- FIX: Detail Jawaban Kuis
DROP POLICY IF EXISTS "sub_answers_insert" ON public.submission_answers;
CREATE POLICY "sub_answers_insert_self" ON public.submission_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.student_id = auth.uid())
  );

DROP POLICY IF EXISTS "sub_answers_select_own" ON public.submission_answers;
CREATE POLICY "sub_answers_select_authorized" ON public.submission_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.student_id = auth.uid())
    OR public.is_instructor_or_admin()
  );

-- ==========================================
-- FIX: PERIZINAN MATERIAL VIEWS (PROGRES)
-- ==========================================
DROP POLICY IF EXISTS "material_views_insert" ON public.material_views;
CREATE POLICY "material_views_insert_self" ON public.material_views
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "material_views_select" ON public.material_views;
CREATE POLICY "material_views_select_authorized" ON public.material_views
  FOR SELECT USING (
    auth.uid() = student_id 
    OR public.is_instructor_or_admin()
  );
