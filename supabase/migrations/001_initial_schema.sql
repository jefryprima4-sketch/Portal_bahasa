-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- ENUMS
-- =====================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE material_type AS ENUM ('pdf', 'audio', 'video'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE skill_category AS ENUM ('listening', 'reading', 'writing', 'technical'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE question_type AS ENUM ('mcq', 'essay', 'matching'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE submission_status AS ENUM ('in_progress', 'submitted'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE attendance_method AS ENUM ('qr', 'manual'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  nim_nip TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_nim_nip ON users(nim_nip);

-- =====================
-- COURSES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);

-- =====================
-- COURSE ENROLLMENT TABLE
-- =====================
CREATE TABLE IF NOT EXISTS course_enroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER NOT NULL DEFAULT 0,
  UNIQUE(course_id, student_id)
);

CREATE INDEX idx_enroll_student ON course_enroll(student_id);
CREATE INDEX idx_enroll_course ON course_enroll(course_id);

-- =====================
-- MATERIALS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type material_type NOT NULL,
  skill_category skill_category,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_course ON materials(course_id);
CREATE INDEX idx_materials_type ON materials(type);

-- =====================
-- QUIZZES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  passing_grade INTEGER NOT NULL DEFAULT 70,
  randomize_order BOOLEAN NOT NULL DEFAULT false,
  shuffle_answers BOOLEAN NOT NULL DEFAULT false,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  is_listening BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_course ON quizzes(course_id);

-- =====================
-- QUESTIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type question_type NOT NULL DEFAULT 'mcq',
  question_text TEXT NOT NULL,
  audio_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);

-- =====================
-- ANSWERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_answers_question ON answers(question_id);

-- =====================
-- SUBMISSIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(5,2),
  submitted_at TIMESTAMPTZ,
  status submission_status NOT NULL DEFAULT 'in_progress',
  UNIQUE(quiz_id, student_id)
);

CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_quiz ON submissions(quiz_id);

-- =====================
-- SUBMISSION ANSWERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS submission_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES answers(id),
  answer_text TEXT,
  UNIQUE(submission_id, question_id)
);

CREATE INDEX idx_sub_answers_submission ON submission_answers(submission_id);
CREATE INDEX idx_sub_answers_question ON submission_answers(question_id);

-- =====================
-- ATTENDANCE TABLE
-- =====================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  method attendance_method NOT NULL DEFAULT 'manual'
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_course ON attendance(course_id);

-- =====================
-- MATERIAL VIEWS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS material_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, material_id)
);

CREATE INDEX idx_material_views_student ON material_views(student_id);

-- =====================
-- RLS POLICIES
-- =====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_views ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_select_instructor_view" ON users FOR SELECT
  USING (EXISTS (SELECT 1 FROM course_enroll ce JOIN courses c ON c.id = ce.course_id WHERE c.instructor_id = auth.uid() AND ce.student_id = users.id));
CREATE POLICY "users_select_admin" ON users FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Courses
CREATE POLICY "courses_select_all" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_insert_instructor" ON courses FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "courses_update_own" ON courses FOR UPDATE
  USING (instructor_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "courses_delete_own" ON courses FOR DELETE
  USING (instructor_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Enrollment
CREATE POLICY "enroll_select_own" ON course_enroll FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "enroll_select_instructor" ON course_enroll FOR SELECT
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_enroll.course_id AND c.instructor_id = auth.uid()));
CREATE POLICY "enroll_insert_admin" ON course_enroll FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Materials
CREATE POLICY "materials_select" ON materials FOR SELECT
  USING (EXISTS (SELECT 1 FROM course_enroll ce WHERE ce.course_id = materials.course_id AND ce.student_id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "materials_insert" ON materials FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "materials_update" ON materials FOR UPDATE
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = materials.course_id AND c.instructor_id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "materials_delete" ON materials FOR DELETE
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = materials.course_id AND c.instructor_id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Quizzes
CREATE POLICY "quizzes_select" ON quizzes FOR SELECT
  USING (EXISTS (SELECT 1 FROM course_enroll ce WHERE ce.course_id = quizzes.course_id AND ce.student_id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "quizzes_insert" ON quizzes FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "quizzes_update" ON quizzes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "quizzes_delete" ON quizzes FOR DELETE
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid())
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Questions & Answers
CREATE POLICY "questions_select" ON questions FOR SELECT USING (true);
CREATE POLICY "questions_insert" ON questions FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "questions_update" ON questions FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "questions_delete" ON questions FOR DELETE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));

CREATE POLICY "answers_select" ON answers FOR SELECT USING (true);
CREATE POLICY "answers_insert" ON answers FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "answers_update" ON answers FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));
CREATE POLICY "answers_delete" ON answers FOR DELETE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));

-- Submissions
CREATE POLICY "submissions_select_own" ON submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "submissions_select_instructor" ON submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM quizzes q JOIN courses c ON c.id = q.course_id WHERE q.id = submissions.quiz_id AND c.instructor_id = auth.uid()));
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "submissions_update" ON submissions FOR UPDATE
  USING (student_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Submission answers
CREATE POLICY "sub_answers_select_own" ON submission_answers FOR SELECT
  USING (EXISTS (SELECT 1 FROM submissions s WHERE s.id = submission_answers.submission_id AND s.student_id = auth.uid()));
CREATE POLICY "sub_answers_insert" ON submission_answers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM submissions s WHERE s.id = submission_answers.submission_id AND s.student_id = auth.uid()));

-- Attendance
CREATE POLICY "attendance_select_own" ON attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "attendance_select_instructor" ON attendance FOR SELECT
  USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = attendance.course_id AND c.instructor_id = auth.uid()));
CREATE POLICY "attendance_insert" ON attendance FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('instructor', 'admin'));

-- Material views
CREATE POLICY "material_views_select" ON material_views FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "material_views_insert" ON material_views FOR INSERT WITH CHECK (student_id = auth.uid());

-- =====================
-- TRIGGERS
-- =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, nim_nip)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    (COALESCE(NEW.raw_user_meta_data->>'role', 'student'))::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'nim_nip', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
