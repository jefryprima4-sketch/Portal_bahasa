-- ==========================================
-- 1. RE-DEFINE HELPER FUNCTIONS (ANTI-RECURSION)
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
BEGIN
  -- Mengambil role langsung dari tabel users menggunakan auth.uid()
  -- Fungsi ini didefinisikan sebagai SECURITY DEFINER untuk melewati RLS
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_my_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_instructor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_my_role() IN ('instructor', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 2. DROP ALL RECURSIVE POLICIES
-- ==========================================

-- Courses
DROP POLICY IF EXISTS "courses_insert_instructor" ON public.courses;
DROP POLICY IF EXISTS "courses_update_own" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_own" ON public.courses;

-- Materials
DROP POLICY IF EXISTS "materials_select" ON public.materials;
DROP POLICY IF EXISTS "materials_insert" ON public.materials;
DROP POLICY IF EXISTS "materials_update" ON public.materials;
DROP POLICY IF EXISTS "materials_delete" ON public.materials;

-- Quizzes
DROP POLICY IF EXISTS "quizzes_select" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_insert" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_update" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_delete" ON public.quizzes;

-- Course Enroll
DROP POLICY IF EXISTS "enroll_insert_admin" ON public.course_enroll;

-- Attendance
DROP POLICY IF EXISTS "attendance_insert" ON public.attendance;

-- ==========================================
-- 3. CREATE NEW SECURE (NON-RECURSIVE) POLICIES
-- ==========================================

-- COURSES
CREATE POLICY "courses_insert_instructor" ON public.courses 
  FOR INSERT WITH CHECK (public.is_instructor_or_admin());

CREATE POLICY "courses_update_own" ON public.courses 
  FOR UPDATE USING (instructor_id = auth.uid() OR public.is_admin());

CREATE POLICY "courses_delete_own" ON public.courses 
  FOR DELETE USING (instructor_id = auth.uid() OR public.is_admin());

-- MATERIALS
CREATE POLICY "materials_select" ON public.materials 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.course_enroll ce WHERE ce.course_id = materials.course_id AND ce.student_id = auth.uid())
    OR public.is_instructor_or_admin()
  );

CREATE POLICY "materials_insert" ON public.materials 
  FOR INSERT WITH CHECK (public.is_instructor_or_admin());

CREATE POLICY "materials_update" ON public.materials 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = materials.course_id AND c.instructor_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "materials_delete" ON public.materials 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = materials.course_id AND c.instructor_id = auth.uid())
    OR public.is_admin()
  );

-- QUIZZES
CREATE POLICY "quizzes_select" ON public.quizzes 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.course_enroll ce WHERE ce.course_id = quizzes.course_id AND ce.student_id = auth.uid())
    OR public.is_instructor_or_admin()
  );

CREATE POLICY "quizzes_insert" ON public.quizzes 
  FOR INSERT WITH CHECK (public.is_instructor_or_admin());

CREATE POLICY "quizzes_update" ON public.quizzes 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "quizzes_delete" ON public.quizzes 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid())
    OR public.is_admin()
  );

-- COURSE ENROLL
CREATE POLICY "enroll_insert_admin" ON public.course_enroll 
  FOR INSERT WITH CHECK (public.is_admin());

-- ATTENDANCE
CREATE POLICY "attendance_insert" ON public.attendance 
  FOR INSERT WITH CHECK (public.is_instructor_or_admin());
