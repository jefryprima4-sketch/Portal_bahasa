# Portal Bahasa MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional language learning portal with auth, course management, material upload/view, MCQ quiz with auto-grading, and role-based dashboards using Next.js + Supabase.

**Architecture:** Next.js frontend hosted on Vercel, Supabase for Auth/Database/Storage/Edge Functions. Supabase RLS enforces data isolation per role. Client uses TanStack Query for server state. Edge Functions handle quiz submission and auto-grading.

**Tech Stack:** Next.js 15 (App Router), TypeScript, TailwindCSS, Supabase JS Client, TanStack Query, Deno Edge Functions, PostgreSQL

**Design System (from stitch/):** Material Design color system with Manrope (headlines) + Inter (body) fonts, Material Symbols Outlined icons, fixed w-72 sidebar, sticky backdrop-blur top nav, `rounded-xl` cards with `shadow-[0px_12px_32px_rgba(25,28,29,0.04)]`, bento grid layouts, primary blue `#004085`. Reference: `stitch/` folder.

**CRITICAL: No lucide-react imports anywhere.** All icons use `<span className="material-symbols-outlined">icon_name</span>`. All component code below has been updated to use Material Symbols.

---

## Design System (Stitch Reference)

### Color Palette (Material Design - all components use this exact palette)

```js
"primary": "#004085",
"primary-container": "#1d57a7",
"primary-fixed": "#d7e2ff",
"primary-fixed-dim": "#abc7ff",
"on-primary": "#ffffff",
"secondary": "#48626e",
"secondary-container": "#cbe7f5",
"secondary-fixed": "#cbe7f5",
"tertiary": "#722b00",
"tertiary-fixed": "#ffdbcc",
"tertiary-container": "#983c00",
"error": "#ba1a1a",
"error-container": "#ffdad6",
"background": "#f8f9fa",
"surface": "#f8f9fa",
"surface-container-lowest": "#ffffff",
"surface-container-low": "#f3f4f5",
"surface-container": "#edeeef",
"surface-bright": "#f8f9fa",
"on-surface": "#191c1d",
"on-surface-variant": "#424752",
"outline": "#727784",
"outline-variant": "#c2c6d4",
```

### Typography
- **Headlines:** `font-family: 'Manrope'` (font-weight: 600-800)
- **Body:** `font-family: 'Inter'` (font-weight: 400-600)
- **Brand:** `font-weight: extrabold`, `tracking-tighter`

### Layout Patterns
- **Sidebar:** `fixed left-0 top-0 w-72 h-screen bg-slate-50`, active state: `bg-white text-blue-700 rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.02)] translate-x-1`
- **Top Nav:** `sticky top-0 z-30 bg-white/80 backdrop-blur-md h-20 shadow-[0px_12px_32px_rgba(25,28,29,0.04)] px-12`
- **Main:** `ml-72 min-h-screen` or `md:ml-72`
- **Cards:** `bg-white rounded-xl shadow-[0px_12px_32px_rgba(25,28,29,0.04)]`
- **Bento Grids:** `grid grid-cols-1 md:grid-cols-3 gap-6`
- **Spacing:** `p-8 lg:p-12` for main content

### Iconography
- Material Symbols Outlined: `<span className="material-symbols-outlined">icon_name</span>`
- Package: CDN link: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap`
- Font variation: `font-variation-settings: 'FILL' 1` for filled state
- No lucide-react — use Material Symbols throughout

### CSS Classes (globals.css)
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

---

## File Structure Map

### Phase 1: Foundation (Tasks 1-4)
| File | Responsibility |
|------|---------------|
| `supabase/migrations/001_initial_schema.sql` | All database tables, RLS policies, triggers |
| `src/lib/supabase/client.ts` | Supabase client singleton |
| `src/lib/supabase/server.ts` | Server-side Supabase client (cookies) |
| `src/lib/supabase/middleware.ts` | Auth middleware for route protection |
| `src/lib/supabase/types.ts` | TypeScript types for all DB tables |

### Phase 2: Auth (Tasks 4-5)
| File | Responsibility |
|------|---------------|
| `src/app/(auth)/layout.tsx` | Auth layout |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/login/actions.ts` | Server actions: signIn, signOut |
| `src/app/(auth)/register/page.tsx` | Student registration page |
| `src/app/(auth)/register/actions.ts` | Server actions: signUp |
| `src/app/(auth)/verify-email/page.tsx` | Email verification pending page |

### Phase 3: Layout & Shared Components (Tasks 6)
| File | Responsibility |
|------|---------------|
| `src/app/layout.tsx` | Root layout + providers |
| `src/app/(dashboard)/layout.tsx` | Authenticated layout with sidebar |
| `src/components/layout/sidebar.tsx` | Role-based navigation sidebar |
| `src/components/layout/header.tsx` | Top header with user info + logout |
| `src/components/ui/button.tsx` | Button component |
| `src/components/ui/input.tsx` | Input component |
| `src/components/ui/card.tsx` | Card component |
| `src/components/ui/alert.tsx` | Alert/notification component |
| `src/components/ui/badge.tsx` | Badge component |
| `src/components/ui/loading.tsx` | Loading spinner |
| `src/components/auth/role-guard.tsx` | Role-based route protection component |
| `src/providers/query-provider.tsx` | TanStack Query provider |

### Phase 4: Student Views (Tasks 7-8)
| File | Responsibility |
|------|---------------|
| `src/app/(dashboard)/student/dashboard/page.tsx` | Student dashboard |
| `src/app/(dashboard)/student/courses/page.tsx` | Course list page |
| `src/app/(dashboard)/student/courses/[id]/page.tsx` | Course detail page |
| `src/app/(dashboard)/student/courses/[id]/materials/[materialId]/page.tsx` | Material viewer |
| `src/hooks/use-student.ts` | Student profile hook |
| `src/hooks/use-courses.ts` | Courses data fetching hooks |

### Phase 5: Quiz Taking (Tasks 9-10)
| File | Responsibility |
|------|---------------|
| `src/app/(dashboard)/student/quizzes/[quizId]/page.tsx` | Quiz taking page |
| `src/app/(dashboard)/student/quizzes/[quizId]/results/page.tsx` | Quiz results page |
| `src/components/quiz/quiz-timer.tsx` | Server-synced countdown timer |
| `src/components/quiz/question-renderer.tsx` | Dynamic question renderer |
| `src/components/quiz/quiz-provider.tsx` | Quiz state management |

### Phase 6: Instructor Features (Tasks 11-13)
| File | Responsibility |
|------|---------------|
| `src/app/(dashboard)/instructor/dashboard/page.tsx` | Instructor dashboard |
| `src/app/(dashboard)/instructor/courses/page.tsx` | Course management list |
| `src/app/(dashboard)/instructor/courses/create/page.tsx` | Create course form |
| `src/app/(dashboard)/instructor/courses/actions.ts` | Course CRUD actions |
| `src/app/(dashboard)/instructor/courses/[id]/materials/page.tsx` | Materials list |
| `src/app/(dashboard)/instructor/courses/[id]/materials/upload/page.tsx` | Upload form |
| `src/app/(dashboard)/instructor/courses/[id]/materials/actions.ts` | Material CRUD actions |
| `src/app/(dashboard)/instructor/courses/[id]/quizzes/page.tsx` | Quiz list |
| `src/app/(dashboard)/instructor/courses/[id]/quizzes/create/page.tsx` | Create quiz |
| `src/app/(dashboard)/instructor/courses/[id]/quizzes/[quizId]/edit/page.tsx` | Edit quiz + questions |
| `src/app/(dashboard)/instructor/courses/[id]/quizzes/actions.ts` | Quiz/question actions |
| `src/app/(dashboard)/instructor/courses/[id]/submissions/page.tsx` | View submissions |

### Phase 7: Admin & Edge (Tasks 14-17)
| File | Responsibility |
|------|---------------|
| `src/app/(dashboard)/admin/page.tsx` | Admin dashboard |
| `src/app/(dashboard)/admin/users/page.tsx` | User management |
| `src/app/(dashboard)/admin/users/actions.ts` | User CRUD actions |
| `src/app/page.tsx` | Landing redirect |
| `src/middleware.ts` | Next.js middleware |
| `supabase/functions/submit-quiz/index.ts` | Edge function: auto-grade |
| `supabase/config.toml` | Supabase project config |

### Config Files
| File | Responsibility |
|------|---------------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | TailwindCSS with stitch colors |
| `tsconfig.json` | TypeScript configuration |
| `.env.example` | Environment variable template |
| `src/app/globals.css` | Global CSS with Material Design tokens |

---

### Task 1: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/config.toml`

- [ ] **Step 1: Write the complete SQL migration**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- ENUMS
-- =====================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
  CREATE TYPE material_type AS ENUM ('pdf', 'audio', 'video');
  CREATE TYPE skill_category AS ENUM ('listening', 'reading', 'writing', 'technical');
  CREATE TYPE question_type AS ENUM ('mcq', 'essay', 'matching');
  CREATE TYPE submission_status AS ENUM ('in_progress', 'submitted');
  CREATE TYPE attendance_method AS ENUM ('qr', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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

-- Enable RLS on all tables
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
CREATE POLICY "sub_answers_select_instructor" ON submission_answers FOR SELECT
  USING (EXISTS (SELECT 1 FROM submission_answers sa JOIN submissions s ON s.id = sa.submission_id JOIN quizzes q ON q.id = s.quiz_id JOIN courses c ON c.id = q.course_id WHERE s.id = submission_answers.submission_id AND c.instructor_id = auth.uid()));
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'nim_nip', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 2: Create Supabase config**

Create: `supabase/config.toml`

```toml
project_id = "your-project-id"
[analytics]
enabled = true
[[functions]]
name = "submit-quiz"
verify_jwt = true
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: initial database schema with RLS policies and trigger"
```

---

### Task 2: Supabase Client Library + TypeScript Types

**Files:**
- Create: `src/lib/supabase/types.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `.env.example`

- [ ] **Step 1: Create TypeScript types**

```typescript
// src/lib/supabase/types.ts
export type UserRole = 'student' | 'instructor' | 'admin';
export type MaterialType = 'pdf' | 'audio' | 'video';
export type SkillCategory = 'listening' | 'reading' | 'writing' | 'technical';
export type QuestionType = 'mcq' | 'essay' | 'matching';
export type SubmissionStatus = 'in_progress' | 'submitted';
export type AttendanceMethod = 'qr' | 'manual';

export interface User {
  id: string; name: string; email: string; nim_nip: string; role: UserRole; created_at: string;
}
export interface Course {
  id: string; title: string; description: string | null; instructor_id: string; created_at: string; instructor?: User;
}
export interface CourseEnroll {
  id: string; course_id: string; student_id: string; enrolled_at: string; progress: number; course?: Course; student?: User;
}
export interface Material {
  id: string; course_id: string; title: string; type: MaterialType; skill_category: SkillCategory | null; file_url: string; created_at: string;
}
export interface Quiz {
  id: string; course_id: string; title: string; duration: number; passing_grade: number;
  randomize_order: boolean; shuffle_answers: boolean; max_attempts: number; is_listening: boolean; created_at: string;
}
export interface Question {
  id: string; quiz_id: string; type: QuestionType; question_text: string; audio_url: string | null; sort_order: number; answers?: Answer[];
}
export interface Answer {
  id: string; question_id: string; answer_text: string; is_correct: boolean; sort_order: number;
}
export interface Submission {
  id: string; quiz_id: string; student_id: string; score: number | null; submitted_at: string | null; status: SubmissionStatus;
}
export interface SubmissionAnswer {
  id: string; submission_id: string; question_id: string; answer_id: string | null; answer_text: string | null;
}
export interface Attendance {
  id: string; student_id: string; course_id: string; timestamp: string; method: AttendanceMethod;
}
export interface MaterialView {
  id: string; student_id: string; material_id: string; viewed_at: string;
}
```

- [ ] **Step 2: Create browser client**

Create: `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return cachedClient;
}
```

- [ ] **Step 3: Create server client**

Create: `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch { /* Cookie setting fails in server components, expected */ }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create environment template**

Create: `.env.example`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 5: Extend types for Database wrapper**

Append to `src/lib/supabase/types.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'created_at'>; Update: Partial<Omit<User, 'created_at'>> };
      courses: { Row: Course; Insert: Omit<Course, 'id' | 'created_at'>; Update: Partial<Omit<Course, 'id' | 'created_at'>> };
      course_enroll: { Row: CourseEnroll; Insert: Omit<CourseEnroll, 'id' | 'enrolled_at'>; Update: Partial<Omit<CourseEnroll, 'id' | 'enrolled_at'>> };
      materials: { Row: Material; Insert: Omit<Material, 'id' | 'created_at'>; Update: Partial<Omit<Material, 'id' | 'created_at'>> };
      quizzes: { Row: Quiz; Insert: Omit<Quiz, 'id' | 'created_at'>; Update: Partial<Omit<Quiz, 'id' | 'created_at'>> };
      questions: { Row: Question; Insert: Omit<Question, 'id'>; Update: Partial<Omit<Question, 'id'>> };
      answers: { Row: Answer; Insert: Omit<Answer, 'id'>; Update: Partial<Omit<Answer, 'id'>> };
      submissions: { Row: Submission; Insert: Omit<Submission, 'id'>; Update: Partial<Omit<Submission, 'id'>> };
      submission_answers: { Row: SubmissionAnswer; Insert: Omit<SubmissionAnswer, 'id'>; Update: Partial<Omit<SubmissionAnswer, 'id'>> };
      attendance: { Row: Attendance; Insert: Omit<Attendance, 'id' | 'timestamp'>; Update: Partial<Omit<Attendance, 'id' | 'timestamp'>> };
      material_views: { Row: MaterialView; Insert: Omit<MaterialView, 'id' | 'viewed_at'>; Update: Partial<Omit<MaterialView, 'id' | 'viewed_at'>> };
    };
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/ .env.example
git commit -m "feat: add Supabase client library and TypeScript types"
```

---

### Task 3: Next.js Project Setup

**Files:**
- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- `src/providers/query-provider.tsx`
- `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Initialize Next.js**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js @tanstack/react-query
```

- [ ] **Step 3: Create query provider**

Create: `src/providers/query-provider.tsx`

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } } })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 4: Create root layout with Manrope + Inter + Material Symbols**

Create: `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal Bahasa - PTKI Medan",
  description: "Platform Pembelajaran Bahasa PTKI Medan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${manrope.variable} ${inter.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create globals.css with Material Design tokens**

Create: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.material-symbols-outlined.filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

@layer base {
  :root {
    --primary: #004085;
    --primary-container: #1d57a7;
    --on-primary: #ffffff;
    --secondary: #48626e;
    --surface: #f8f9fa;
    --surface-container-lowest: #ffffff;
    --surface-container-low: #f3f4f5;
    --surface-container: #edeeef;
    --on-surface: #191c1d;
    --on-surface-variant: #424752;
    --outline: #727784;
    --outline-variant: #c2c6d4;
    --error: #ba1a1a;
    --error-container: #ffdad6;
  }
}

@layer base {
  body {
    font-family: var(--font-inter), sans-serif;
    background: var(--surface);
    color: var(--on-surface);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-manrope), sans-serif;
    font-weight: 700;
  }
}

.font-headline { font-family: var(--font-manrope), sans-serif; }
.font-body { font-family: var(--font-inter), sans-serif; }
```

- [ ] **Step 6: Create landing redirect**

Create: `src/app/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role === 'admin') redirect('/admin');
  if (profile?.role === 'instructor') redirect('/instructor/dashboard');
  redirect('/student/dashboard');
}
```

- [ ] **Step 7: Create dashboard layout shell**

Create: `src/app/(dashboard)/layout.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import type { UserRole } from '@/lib/supabase/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile) redirect('/login');
  return (
    <div className="min-h-screen">
      <Sidebar role={profile.role as UserRole} />
      <div className="ml-72 min-h-screen">
        <Header userName={profile.name} userRole={profile.role as UserRole} />
        <main className="p-8 lg:p-12">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: initialize Next.js with Material Design theme and dashboard layout"
```

---

### Task 4: Authentication Pages & Server Actions

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/actions.ts`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/register/actions.ts`
- Create: `src/app/(auth)/verify-email/page.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/alert.tsx`

- [ ] **Step 1: Create UI components**

Create: `src/components/ui/input.tsx`

```tsx
import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string;
}
export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>{label}</label>}
      <input
        className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-[var(--error)]' : 'border-[var(--outline-variant)]'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
    </div>
  );
}
```

Create: `src/components/ui/button.tsx`

```tsx
import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}
export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'text-white hover:opacity-90',
    secondary: 'border border-[var(--outline)] hover:bg-[var(--surface-container)]',
    ghost: 'hover:bg-[var(--surface-container-low)]',
    destructive: 'text-white hover:opacity-90',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  };
  const bgColors: Record<string, string> = {
    primary: 'bg-[var(--primary)]',
    secondary: 'bg-transparent',
    ghost: 'bg-transparent',
    destructive: 'bg-[var(--error)]',
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${bgColors[variant]} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
```

Create: `src/components/ui/card.tsx`

```tsx
import React from 'react';
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[var(--surface-container-lowest)] rounded-xl shadow-[0px_12px_32px_rgba(25,28,29,0.04)] ${className}`}>
      {children}
    </div>
  );
}
export function CardHeader({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}
export function CardTitle({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`text-lg font-semibold font-headline ${className}`}>{children}</h3>;
}
export function CardDescription({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-sm text-[var(--on-surface-variant)] ${className}`}>{children}</p>;
}
export function CardContent({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
```

Create: `src/components/ui/alert.tsx`

```tsx
import React from 'react';
interface AlertProps {
  variant?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
  children: React.ReactNode;
}
export function Alert({ variant = 'info', title, children }: AlertProps) {
  const variants: Record<string, string> = {
    info: 'bg-[#d7e2ff]/50 text-[#004085] border-[#abc7ff]',
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-[var(--error-container)]/50 text-[var(--error)] border-[var(--error-container)]',
    warning: 'bg-[var(--tertiary-fixed)]/50 text-[var(--tertiary)] border-[var(--tertiary-fixed)]',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 ${variants[variant]}`} role="alert">
      {title && <p className="font-medium">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create auth layout**

Create: `src/app/(auth)/layout.tsx`

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary-fixed)]/30 to-[var(--surface)] p-4">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create login server actions**

Create: `src/app/(auth)/login/actions.ts`

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!email || !password) return { error: 'Email dan password harus diisi' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
```

- [ ] **Step 4: Create register server actions**

Create: `src/app/(auth)/register/actions.ts`

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function register(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nim = formData.get('nim') as string;
  if (!name || !email || !password || !nim) return { error: 'Semua field harus diisi' };
  if (password.length < 8) return { error: 'Password minimal 8 karakter' };
  if (!/^\d{8,10}$/.test(nim)) return { error: 'NIM harus berupa angka 8-10 digit' };
  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, nim_nip: nim, role: 'student' } },
  });
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  redirect('/verify-email');
}
```

- [ ] **Step 5: Create login page**

Create: `src/app/(auth)/login/page.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from './actions';

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">school</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-headline" style={{ color: 'var(--primary)' }}>Portal Bahasa</CardTitle>
        <CardDescription>Platform Pembelajaran Bahasa PTKI Medan</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={login} className="flex flex-col gap-4">
          <Input label="Email" name="email" type="email" placeholder="nim@ptki.ac.id" required />
          <Input label="Password" name="password" type="password" placeholder="Masukkan password" required />
          <Button type="submit" size="lg" className="mt-2">Masuk</Button>
          <p className="text-center text-sm text-[var(--on-surface-variant)]">
            Belum punya akun?{' '}
            <a href="/register" className="font-medium" style={{ color: 'var(--primary)' }}>
              Daftar di sini
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Create register page**

Create: `src/app/(auth)/register/page.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { register } from './actions';

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-headline">Daftar Akun</CardTitle>
        <CardDescription>Registrasi mahasiswa baru</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={register} className="flex flex-col gap-4">
          <Input label="Nama Lengkap" name="name" type="text" placeholder="Masukkan nama lengkap" required />
          <Input label="Email" name="email" type="email" placeholder="nim@ptki.ac.id" required />
          <Input label="NIM" name="nim" type="text" placeholder="8-10 digit angka" required />
          <Input label="Password" name="password" type="password" placeholder="Minimal 8 karakter" minLength={8} required />
          <Button type="submit" size="lg" className="mt-2">Daftar</Button>
          <p className="text-center text-sm text-[var(--on-surface-variant)]">
            Sudah punya akun?{' '}
            <a href="/login" className="font-medium" style={{ color: 'var(--primary)' }}>Login di sini</a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 7: Create verify email page**

Create: `src/app/(auth)/verify-email/page.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <span className="material-symbols-outlined text-4xl" style={{ color: 'var(--primary)' }}>mark_email_unread</span>
        </div>
        <CardTitle className="text-xl font-headline">Verifikasi Email</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="info">
          Kami telah mengirim link verifikasi ke email Anda. Silakan cek inbox dan klik link tersebut untuk mengaktifkan akun.
        </Alert>
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--on-surface-variant)]">
            Setelah verifikasi, Anda bisa{' '}
            <a href="/login" className="font-medium" style={{ color: 'var(--primary)' }}>login</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/ src/app/\(auth\)/
git commit -m "feat: add authentication pages with Material Design styling"
```

---

### Task 5: Auth Middleware & Role Guards

**Files:**
- Create: `src/middleware.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/components/auth/role-guard.tsx`

- [ ] **Step 1: Create Supabase middleware helper**

Create: `src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );
  await supabase.auth.getUser();
  return supabaseResponse;
}
```

- [ ] **Step 2: Create Next.js middleware**

Create: `src/middleware.ts`

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/login', '/register', '/verify-email'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.value);
  if (!hasSession && !isPublicRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }
  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

- [ ] **Step 3: Create Role Guard component**

Create: `src/components/auth/role-guard.tsx`

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/supabase/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (!profile) { router.push('/login'); return; }
      if (!allowedRoles.includes(profile.role as UserRole)) {
        if (profile.role === 'student') router.push('/student/dashboard');
        else if (profile.role === 'instructor') router.push('/instructor/dashboard');
        else router.push('/admin');
        return;
      }
      setRole(profile.role as UserRole);
      setLoading(false);
    }
    checkRole();
  }, [allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--outline-variant)] border-t-[var(--primary)]" />
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/lib/supabase/middleware.ts src/components/auth/
git commit -m "feat: add auth middleware and role-based access guard"
```

---

### Task 6: Sidebar & Header Components (Stitch Design)

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/ui/loading.tsx`
- Create: `src/components/ui/badge.tsx`

- [ ] **Step 1: Create Sidebar (Stitch pattern: fixed w-72)**

Create: `src/components/layout/sidebar.tsx`

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/supabase/types';

interface SidebarProps { role: UserRole; }

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navItems: Record<UserRole, { label: string; href: string; icon: string }[]> = {
    student: [
      { label: 'Dashboard', href: '/student/dashboard', icon: 'dashboard' },
      { label: 'Course Saya', href: '/student/courses', icon: 'menu_book' },
    ],
    instructor: [
      { label: 'Dashboard', href: '/instructor/dashboard', icon: 'dashboard' },
      { label: 'Kelola Course', href: '/instructor/courses', icon: 'menu_book' },
      { label: 'Presensi', href: '/instructor/attendance', icon: 'qr_code_scanner' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
      { label: 'Kelola User', href: '/admin/users', icon: 'people' },
      { label: 'Kelola Course', href: '/admin/courses', icon: 'menu_book' },
      { label: 'Pengaturan', href: '/admin/settings', icon: 'settings' },
    ],
  };

  const roleLabels: Record<UserRole, string> = {
    student: 'Mahasiswa', instructor: 'Dosen', admin: 'Admin',
  };

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-slate-50 border-r border-[var(--outline-variant)] overflow-y-auto z-50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <span className="material-symbols-outlined text-white">school</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-[var(--on-surface)]">Portal Bahasa</h2>
            <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>{roleLabels[role]}</p>
          </div>
        </div>
      </div>
      <nav className="mt-2">
        {navItems[role].map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-all mx-2 rounded-lg
                ${isActive
                  ? 'bg-white text-[var(--primary)] rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.02)] translate-x-1'
                  : 'text-[var(--on-surface-variant)] hover:bg-white/50'
                }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create Header (Stitch pattern: sticky backdrop-blur)**

Create: `src/components/layout/header.tsx`

```tsx
'use client';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/supabase/types';

interface HeaderProps { userName: string; userRole: UserRole; }

export function Header({ userName, userRole }: HeaderProps) {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const roleLabels: Record<UserRole, string> = { student: 'Mahasiswa', instructor: 'Dosen', admin: 'Admin' };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md h-20 shadow-[0px_12px_32px_rgba(25,28,29,0.04)] px-12 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-headline font-semibold" style={{ color: 'var(--primary)' }}>Portal Bahasa</h1>
        <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>{roleLabels[userRole]} - {userName}</p>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg border border-[var(--outline)] px-4 py-2 text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
      >
        <span className="material-symbols-outlined text-sm">logout</span>
        Keluar
      </button>
    </header>
  );
}
```

- [ ] **Step 3: Create Loading and Badge components**

Create: `src/components/ui/loading.tsx`

```tsx
export function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--outline-variant)] border-t-[var(--primary)]" />
    </div>
  );
}
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[var(--surface-container)] rounded w-1/4" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[var(--surface-container)] rounded-xl" />)}
      </div>
    </div>
  );
}
```

Create: `src/components/ui/badge.tsx`

```tsx
import React from 'react';
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}
export function Badge({ variant = 'default', children }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-[var(--tertiary-fixed)]/50 text-[var(--tertiary)]',
    error: 'bg-[var(--error-container)]/50 text-[var(--error)]',
    info: 'bg-[var(--primary-fixed)]/50 text-[var(--primary)]',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/ src/components/ui/loading.tsx src/components/ui/badge.tsx
git commit -m "feat: add sidebar, header, loading, and badge with Stitch design system"
```

---

### Task 7: Student Dashboard

**Files:**
- Create: `src/app/(dashboard)/student/dashboard/page.tsx`
- Create: `src/app/(dashboard)/student/courses/page.tsx`
- Create: `src/hooks/use-student.ts`
- Create: `src/hooks/use-courses.ts`

- [ ] **Step 1: Create data fetching hooks**

Create: `src/hooks/use-student.ts`

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useStudent() {
  return useQuery({
    queryKey: ['student'],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
  });
}
```

Create: `src/hooks/use-courses.ts`

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useStudentCourses(studentId: string) {
  return useQuery({
    queryKey: ['student-courses', studentId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('course_enroll').select('*, courses (*)').eq('student_id', studentId);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('courses').select('*, instructor:instructor_id (*)').eq('id', courseId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useCourseMaterials(courseId: string) {
  return useQuery({
    queryKey: ['materials', courseId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('materials').select('*').eq('course_id', courseId).order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useCourseQuizzes(courseId: string) {
  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}
```

- [ ] **Step 2: Create student dashboard (Server Component with Stitch design)**

Create: `src/app/(dashboard)/student/dashboard/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student } = await supabase.from('users').select('*').eq('id', user.id).single();
  const { data: enrollments } = await supabase.from('course_enroll').select('*, courses (id, title, description)').eq('student_id', user.id);
  const { data: submissions } = await supabase
    .from('submissions').select('*, quizzes (id, title, course_id, courses (title))')
    .eq('student_id', user.id).eq('status', 'submitted').order('submitted_at', { ascending: false }).limit(5);

  const gradedSubmissions = submissions?.filter((s: any) => s.score !== null) || [];
  const avgScore = gradedSubmissions.length
    ? (gradedSubmissions.reduce((sum: number, s: any) => sum + Number(s.score), 0) / gradedSubmissions.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h2 className="text-3xl font-headline font-bold" style={{ color: 'var(--on-surface)' }}>
          Selamat datang, {student?.name}!
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>NIM: {student?.nim_nip}</p>
      </div>

      {/* Bento grid stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-fixed)]/30 flex items-center justify-center">
              <span className="material-symbols-outlined filled" style={{ color: 'var(--primary)' }}>menu_book</span>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Course Aktif</p>
              <p className="text-2xl font-bold font-headline">{enrollments?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--secondary-fixed)]/50 flex items-center justify-center">
              <span className="material-symbols-outlined filled" style={{ color: 'var(--secondary)' }}>quiz</span>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Quiz Selesai</p>
              <p className="text-2xl font-bold font-headline">{submissions?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined filled" style={{ color: '#2e7d32' }}>trending_up</span>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Rata-rata Nilai</p>
              <p className="text-2xl font-bold font-headline">{avgScore}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active courses */}
      <Card>
        <CardHeader>
          <CardTitle>Course Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enroll: any) => (
                <a key={enroll.course_id} href={`/student/courses/${enroll.course_id}`}
                  className="block rounded-xl border border-[var(--outline-variant)] p-5 hover:shadow-md transition-shadow bg-[var(--surface-container-lowest)]">
                  <h3 className="font-semibold font-headline text-[var(--on-surface)]">{enroll.courses?.title}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>{enroll.courses?.description || 'Tidak ada deskripsi'}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--on-surface-variant)' }}>Progress</span>
                      <span className="font-semibold">{enroll.progress}%</span>
                    </div>
                    <div className="mt-1 h-2 bg-[var(--surface-container)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary)] transition-all rounded-full" style={{ width: `${enroll.progress}%` }} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Belum ada course aktif. Hubungi admin.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent submissions */}
      {(submissions?.length || 0) > 0 && (
        <Card>
          <CardHeader><CardTitle>Quiz Terakhir Dikerjakan</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissions.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between py-3 border-b border-[var(--outline-variant)] last:border-0">
                  <div>
                    <p className="font-medium">{sub.quizzes?.title}</p>
                    <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{sub.quizzes?.courses?.title}</p>
                  </div>
                  <Badge variant={Number(sub.score) >= 70 ? 'success' : 'error'}>Skor: {sub.score}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create student courses list page**

Create: `src/app/(dashboard)/student/courses/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';

export default async function StudentCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: enrollments } = await supabase.from('course_enroll').select('*, courses (*)').eq('student_id', user.id);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold">Course Saya</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments?.map((enroll: any) => (
          <a key={enroll.course_id} href={`/student/courses/${enroll.course_id}`}
            className="block bg-[var(--surface-container-lowest)] rounded-xl shadow-[0px_12px_32px_rgba(25,28,29,0.04)] p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-fixed)]/30 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined filled" style={{ color: 'var(--primary)' }}>menu_book</span>
            </div>
            <h3 className="font-semibold font-headline">{enroll.courses?.title}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>{enroll.courses?.description || 'Tidak ada deskripsi'}</p>
          </a>
        ))}
      </div>
      {(!enrollments || enrollments.length === 0) && (
        <p className="text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Belum ada course.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/ src/app/\(dashboard\)/student/
git commit -m "feat: add student dashboard with stats, course cards, and submissions"
```

---

### Task 8: Course Detail & Material Viewer (Student)

**Files:**
- Create: `src/app/(dashboard)/student/courses/[id]/page.tsx`
- Create: `src/app/(dashboard)/student/courses/[id]/materials/[materialId]/page.tsx`

- [ ] **Step 1: Create course detail page**

Create: `src/app/(dashboard)/student/courses/[id]/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const typeIcons: Record<string, string> = { pdf: 'picture_as_pdf', audio: 'headphones', video: 'smart_display' };
const typeColors: Record<string, string> = { pdf: 'info', audio: 'warning', video: 'success' };
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: course } = await supabase.from('courses').select('*, instructor:instructor_id (name, email)').eq('id', id).single();
  if (!course) return <p className="text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Course tidak ditemukan.</p>;

  const { data: materials } = await supabase.from('materials').select('*').eq('course_id', id).order('created_at', { ascending: true });
  const { data: quizzes } = await supabase.from('quizzes').select('*').eq('course_id', id).order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <a href="/student/courses" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← Kembali</a>
        <h2 className="text-2xl font-headline font-bold mt-2">{course.title}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>{course.description || 'Tidak ada deskripsi'}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--outline)' }}>Dosen: {course.instructor?.name || course.instructor?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Materi Pembelajaran</CardTitle></CardHeader>
          <CardContent>
            {materials?.length ? (
              <ul className="space-y-2">
                {materials.map((mat: any) => (
                  <li key={mat.id}>
                    <a href={`/student/courses/${id}/materials/${mat.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)] transition-colors">
                      <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>{typeIcons[mat.type] || 'description'}</span>
                      <span className="text-sm font-medium flex-1 truncate">{mat.title}</span>
                      <Badge variant={typeColors[mat.type] as BadgeVariant}>{mat.type.toUpperCase()}</Badge>
                    </a>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-center py-4" style={{ color: 'var(--on-surface-variant)' }}>Belum ada materi.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quiz</CardTitle></CardHeader>
          <CardContent>
            {quizzes?.length ? (
              <ul className="space-y-2">
                {quizzes.map((quiz: any) => (
                  <li key={quiz.id}>
                    <a href={`/student/quizzes/${quiz.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)] transition-colors">
                      <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>{quiz.is_listening ? 'headphones' : 'quiz'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{quiz.title}</p>
                        <p className="text-xs" style={{ color: 'var(--outline)' }}>{quiz.duration} menit • Passing: {quiz.passing_grade}%</p>
                      </div>
                      <Badge variant={quiz.is_listening ? 'warning' : 'info'}>{quiz.is_listening ? 'LISTENING' : 'QUIZ'}</Badge>
                    </a>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-center py-4" style={{ color: 'var(--on-surface-variant)' }}>Belum ada quiz.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create material viewer page**

Create: `src/app/(dashboard)/student/courses/[id]/materials/[materialId]/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import type { MaterialType } from '@/lib/supabase/types';

export default async function MaterialViewerPage({ params }: { params: Promise<{ id: string; materialId: string }> }) {
  const { id, materialId } = await params;
  const supabase = await createClient();
  const { data: material } = await supabase.from('materials').select('*').eq('id', materialId).single();
  if (!material) return <p className="text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Materi tidak ditemukan.</p>;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('material_views').upsert({ student_id: user.id, material_id: materialId }, { onConflict: 'student_id,material_id' });
  }

  const renderMaterial = () => {
    switch (material.type as MaterialType) {
      case 'pdf': return <iframe src={material.file_url} className="w-full h-[70vh] rounded-lg border" title="PDF" />;
      case 'audio': return <audio controls className="w-full" src={material.file_url} />;
      case 'video': return <video controls className="w-full max-h-[70vh] rounded-lg" src={material.file_url} />;
      default: return <p>Tipe file tidak didukung.</p>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <a href={`/student/courses/${id}`} className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← Kembali ke Course</a>
        <h2 className="text-2xl font-headline font-bold mt-2">{material.title}</h2>
        <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Tipe: {material.type.toUpperCase()}</p>
      </div>
      <Card><div className="p-6">{renderMaterial()}</div></Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/student/courses/"
git commit -m "feat: add course detail and material viewer for students"
```

---

### Task 9: Quiz Taking Page with Timer

**Files:**
- Create: `src/app/(dashboard)/student/quizzes/[quizId]/page.tsx`
- Create: `src/components/quiz/quiz-timer.tsx`
- Create: `src/components/quiz/question-renderer.tsx`
- Create: `src/components/quiz/quiz-provider.tsx`

- [ ] **Step 1: Create Quiz Timer**

Create: `src/components/quiz/quiz-timer.tsx`

```tsx
'use client';
import { useState, useEffect } from 'react';

interface QuizTimerProps { durationMinutes: number; startTime: number; onTimeUp: () => void; }

export function QuizTimer({ durationMinutes, startTime, onTimeUp }: QuizTimerProps) {
  const [remaining, setRemaining] = useState(durationMinutes * 60);

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    setRemaining(Math.max(0, durationMinutes * 60 - elapsed));
  }, [durationMinutes, startTime]);

  useEffect(() => {
    if (remaining <= 0) { onTimeUp(); return; }
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(timer); onTimeUp(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const percentage = (remaining / (durationMinutes * 60)) * 100;
  const isLow = remaining < 120;
  const isCritical = remaining < 60;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {isCritical ? <span className="text-[var(--error)] animate-pulse">Waktu hampir habis!</span> : 'Sisa Waktu'}
        </span>
        <span className={`text-2xl font-mono font-bold ${isCritical ? 'text-[var(--error)] animate-pulse' : isLow ? 'text-yellow-600' : ''}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="h-2 bg-[var(--surface-container)] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${isCritical ? 'bg-[var(--error)]' : isLow ? 'bg-yellow-500' : 'bg-[var(--primary)]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Question Renderer**

Create: `src/components/quiz/question-renderer.tsx`

```tsx
'use client';
import type { Question, Answer } from '@/lib/supabase/types';

interface QuestionRendererProps {
  question: Question & { answers: Answer[] };
  selectedAnswerId: string | null;
  answerText: string;
  onAnswerSelect: (answerId: string) => void;
  onTextChange: (text: string) => void;
  questionIndex: number;
  totalQuestions: number;
}

export function QuestionRenderer({
  question, selectedAnswerId, answerText, onAnswerSelect, onTextChange, questionIndex, totalQuestions
}: QuestionRendererProps) {
  const isMCQ = question.type === 'mcq';
  const sortedAnswers = [...question.answers].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4 p-6 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm" style={{ color: 'var(--outline)' }}>Soal {questionIndex + 1} dari {totalQuestions}</span>
          <p className="text-lg font-medium mt-1">{question.question_text}</p>
        </div>
        {question.audio_url && (
          <div className="ml-4">
            <audio controls src={question.audio_url} className="max-w-xs" />
          </div>
        )}
      </div>
      {isMCQ ? (
        <div className="space-y-2 mt-4">
          {sortedAnswers.map((answer) => (
            <label key={answer.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedAnswerId === answer.id ? 'border-[var(--primary)] bg-[var(--primary-fixed)]/20' : 'hover:bg-[var(--surface-container-low)]'
              }`}>
              <input type="radio" name={`question_${question.id}`} checked={selectedAnswerId === answer.id}
                onChange={() => onAnswerSelect(answer.id)} className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-sm">{answer.answer_text}</span>
            </label>
          ))}
        </div>
      ) : (
        <textarea
          className="w-full min-h-[150px] rounded-lg border border-[var(--outline-variant)] p-3 text-sm mt-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          placeholder="Tulis jawaban Anda di sini..." value={answerText}
          onChange={(e) => onTextChange(e.target.value)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create Quiz Provider**

Create: `src/components/quiz/quiz-provider.tsx`

```tsx
'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface QuizState { answers: Record<string, { answerId?: string; text?: string }>; currentQuestion: number; }
interface QuizContextType {
  state: QuizState;
  setAnswer: (questionId: string, answerId?: string, text?: string) => void;
  setCurrentQuestion: (index: number) => void;
  getAnswers: () => Record<string, { answerId?: string; text?: string }>;
}
const QuizContext = createContext<QuizContextType | null>(null);
export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
}
export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>({ answers: {}, currentQuestion: 0 });
  const setAnswer = useCallback((questionId: string, answerId?: string, text?: string) => {
    setState((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: { answerId, text } } }));
  }, []);
  const setCurrentQuestion = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentQuestion: index }));
  }, []);
  const getAnswers = useCallback(() => state.answers, [state.answers]);
  return <QuizContext.Provider value={{ state, setAnswer, setCurrentQuestion, getAnswers }}>{children}</QuizContext.Provider>;
}
```

- [ ] **Step 4: Create quiz taking page**

Create: `src/app/(dashboard)/student/quizzes/[quizId]/page.tsx`

```tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Question, Answer } from '@/lib/supabase/types';
import { QuizProvider, useQuiz } from '@/components/quiz/quiz-provider';
import { QuizTimer } from '@/components/quiz/quiz-timer';
import { QuestionRenderer } from '@/components/quiz/question-renderer';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

function QuizContent({ quizId, quiz }: { quizId: string; quiz: any }) {
  const router = useRouter();
  const supabase = createClient();
  const { state, setAnswer, setCurrentQuestion, getAnswers } = useQuiz();
  const [questions, setQuestions] = useState<(Question & { answers: Answer[] })[]>([]);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase.from('questions').select(`*, answers (*)`).eq('quiz_id', quizId).order('sort_order', { ascending: true });
      if (error) { console.error(error); return; }
      let qs = data as (Question & { answers: Answer[] })[];
      if (quiz.randomize_order) qs = qs.sort(() => Math.random() - 0.5);
      if (quiz.shuffle_answers) qs = qs.map(q => ({ ...q, answers: [...q.answers].sort(() => Math.random() - 0.5) }));
      setQuestions(qs);
      setLoading(false);
    }
    fetchQuestions();
  }, [quizId, quiz]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const answers = getAnswers();
    const answersArray = Object.entries(answers).map(([qId, val]) => ({ question_id: qId, answer_id: val.answerId || null, answer_text: val.text || null }));
    try {
      const { data, error } = await supabase.functions.invoke('submit-quiz', { body: { quiz_id: quizId, answers: answersArray } });
      if (error) throw error;
      router.push(`/student/quizzes/${quizId}/results?score=${data.score}`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal submit quiz.');
      setSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => { handleSubmit(); }, []);

  // Tab tracking
  useEffect(() => {
    const handler = () => { if (document.hidden) console.log('Tab hidden'); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--outline-variant)] border-t-[var(--primary)]" /></div>;
  if (!questions.length) return <Alert variant="error">Tidak ada soal dalam quiz ini.</Alert>;

  const currentQ = questions[state.currentQuestion];
  const currentAnswer = state.answers[currentQ?.id] || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold">{quiz.title}</h2>
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Soal {state.currentQuestion + 1} dari {questions.length}</p>
        </div>
        <div className="w-64"><QuizTimer durationMinutes={quiz.duration} startTime={startTime} onTimeUp={handleTimeUp} /></div>
      </div>
      <QuestionRenderer question={currentQ} selectedAnswerId={currentAnswer.answerId || null} answerText={currentAnswer.text || ''}
        onAnswerSelect={(id) => setAnswer(currentQ.id, id)} onTextChange={(t) => setAnswer(currentQ.id, undefined, t)}
        questionIndex={state.currentQuestion} totalQuestions={questions.length} />
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentQuestion(state.currentQuestion - 1)} disabled={state.currentQuestion === 0}>
          <span className="material-symbols-outlined text-sm mr-1">chevron_left</span> Sebelumnya
        </Button>
        <div className="flex gap-1 flex-wrap justify-center">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQuestion(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                i === state.currentQuestion ? 'bg-[var(--primary)] text-white' :
                state.answers[questions[i].id] ? 'bg-green-200 text-green-800' : 'bg-[var(--surface-container)] hover:bg-[var(--surface-container-low)]'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
        {state.currentQuestion < questions.length - 1 ? (
          <Button variant="ghost" onClick={() => setCurrentQuestion(state.currentQuestion + 1)}>
            Selanjutnya <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            <span className="material-symbols-outlined text-sm mr-1">send</span> Submit
          </Button>
        )}
      </div>
    </div>
  );
}

export default function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    params.then(async ({ quizId }) => {
      const { data, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
      if (error) { window.location.href = '/student/dashboard'; return; }
      setQuizData(data); setLoading(false);
    });
  }, [params]);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--outline-variant)] border-t-[var(--primary)]" /></div>;
  return <QuizProvider><QuizContent quizId={(params as any).quizId || ''} quiz={quizData} /></QuizProvider>;
}
```

- [ ] **Step 5: Commit**

```bash
git add "src/components/quiz/" "src/app/(dashboard)/student/quizzes/"
git commit -m "feat: add quiz taking page with timer and question navigation"
```

---

### Task 10: Quiz Results Page

**Files:**
- Create: `src/app/(dashboard)/student/quizzes/[quizId]/results/page.tsx`

- [ ] **Step 1: Create quiz results page**

Create: `src/app/(dashboard)/student/quizzes/[quizId]/results/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function QuizResultsPage({ params, searchParams }: { params: Promise<{ quizId: string }>; searchParams: Promise<{ score?: string }> }) {
  const { quizId } = await params;
  const { score: scoreParam } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: quiz } = await supabase.from('quizzes').select('*, courses (id, title)').eq('id', quizId).single();
  const { data: submission } = await supabase.from('submissions').select('*, submission_answers (*, question:question_id (question_text, type), answer:answer_id (answer_text, is_correct))').eq('quiz_id', quizId).eq('student_id', user.id).single();

  const score = scoreParam ? parseFloat(scoreParam) : submission?.score || 0;
  const passed = score >= (quiz?.passing_grade || 70);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="text-center p-8">
        <div className="mb-4">
          <span className="material-symbols-outlined text-6xl" style={{ color: passed ? '#2e7d32' : 'var(--error)' }}>
            {passed ? 'check_circle' : 'cancel'}
          </span>
        </div>
        <h2 className="text-3xl font-headline font-bold">{passed ? 'Selamat! Anda Lulus' : 'Belum Lulus'}</h2>
        <p className="text-6xl font-bold mt-6 font-headline" style={{ color: 'var(--primary)' }}>{score.toFixed(1)}</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant={passed ? 'success' : 'error'}>{passed ? 'LULUS' : 'TIDAK LULUS'}</Badge>
          <span className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Passing Grade: {quiz?.passing_grade}%</span>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>{quiz?.title}</CardTitle><p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{quiz?.courses?.title}</p></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p style={{ color: 'var(--on-surface-variant)' }}>Total Soal</p><p className="font-semibold">{submission?.submission_answers?.length || 0}</p></div>
            <div><p style={{ color: 'var(--on-surface-variant)' }}>Jawaban Benar</p><p className="font-semibold">{submission?.submission_answers?.filter((sa: any) => sa.answer?.is_correct).length || 0}</p></div>
          </div>
        </CardContent>
      </Card>

      {submission?.submission_answers?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Review Jawaban</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {submission.submission_answers.map((sa: any, index: number) => (
              <div key={sa.id} className="border border-[var(--outline-variant)] rounded-lg p-4 space-y-2">
                <p className="font-medium">{index + 1}. {sa.question?.question_text}</p>
                {sa.answer?.answer_text && (
                  <p className="text-sm flex items-center gap-1" style={{ color: sa.answer.is_correct ? '#2e7d32' : 'var(--error)' }}>
                    <span className="material-symbols-outlined text-sm filled">{sa.answer.is_correct ? 'check_circle' : 'cancel'}</span>
                    {sa.answer.answer_text}
                  </p>
                )}
                {sa.answer_text && <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Essay: {sa.answer_text}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <a href={`/student/courses/${quiz?.course_id}`} className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>← Kembali ke Course</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(dashboard)/student/quizzes/[quizId]/results/"
git commit -m "feat: add quiz results page with score display"
```

---

### Task 11: Instructor Dashboard & Course Management

**Files:**
- Create: `src/app/(dashboard)/instructor/courses/actions.ts`
- Create: `src/app/(dashboard)/instructor/dashboard/page.tsx`
- Create: `src/app/(dashboard)/instructor/courses/page.tsx`
- Create: `src/app/(dashboard)/instructor/courses/create/page.tsx`

- [ ] **Step 1: Create instructor course actions**

Create: `src/app/(dashboard)/instructor/courses/actions.ts`

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  if (!title) return { error: 'Title is required' };
  const { error } = await supabase.from('courses').insert({ title, description, instructor_id: user.id });
  if (error) return { error: error.message };
  revalidatePath('/instructor/courses');
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) return { error: error.message };
  revalidatePath('/instructor/courses');
  return { success: true };
}
```

- [ ] **Step 2: Create instructor dashboard**

Create: `src/app/(dashboard)/instructor/dashboard/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function InstructorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: courses } = await supabase.from('courses').select('*').eq('instructor_id', user.id);
  const courseIds = courses?.map(c => c.id) || [];
  const { data: enrollments } = courseIds.length ? await supabase.from('course_enroll').select('course_id').in('course_id', courseIds) : { data: [] };
  const { data: submissions } = courseIds.length ? await supabase.from('submissions').select('score, quizzes (course_id)').in('quizzes.course_id', courseIds).eq('status', 'submitted') : { data: [] };

  const graded = (submissions || []).filter((s: any) => s.score !== null);
  const avgScore = graded.length ? (graded.reduce((s: number, x: any) => s + Number(x.score), 0) / graded.length).toFixed(1) : 'N/A';

  const stats = [
    { label: 'Course Aktif', value: courses?.length || 0, icon: 'menu_book' },
    { label: 'Total Mahasiswa', value: enrollments?.length || 0, icon: 'people' },
    { label: 'Rata-rata Nilai', value: avgScore, icon: 'trending_up' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold">Dashboard Dosen</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-fixed)]/30 flex items-center justify-center">
                <span className="material-symbols-outlined filled" style={{ color: 'var(--primary)' }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{s.label}</p>
                <p className="text-2xl font-bold font-headline">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Course Saya</CardTitle></CardHeader>
        <CardContent><a href="/instructor/courses" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>Kelola course →</a></CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create instructor courses list**

Create: `src/app/(dashboard)/instructor/courses/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function InstructorCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: courses } = await supabase.from('courses').select('*').eq('instructor_id', user.id).order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline font-bold">Kelola Course</h2>
        <a href="/instructor/courses/create">
          <Button><span className="material-symbols-outlined text-sm mr-1">add</span> Buat Course Baru</Button>
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course: any) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-fixed)]/30 flex items-center justify-center">
                <span className="material-symbols-outlined filled" style={{ color: 'var(--primary)' }}>menu_book</span>
              </div>
              <h3 className="font-semibold font-headline">{course.title}</h3>
              <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{course.description || 'Tidak ada deskripsi'}</p>
              <div className="flex gap-2 pt-2">
                <a href={`/instructor/courses/${course.id}/materials`}><Button variant="secondary" size="sm">Materi</Button></a>
                <a href={`/instructor/courses/${course.id}/quizzes`}><Button variant="secondary" size="sm">Quiz</Button></a>
                <a href={`/instructor/courses/${course.id}/submissions`}><Button variant="secondary" size="sm">Nilai</Button></a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!courses || !courses.length) && <p className="text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Belum ada course.</p>}
    </div>
  );
}
```

- [ ] **Step 4: Create course form**

Create: `src/app/(dashboard)/instructor/courses/create/page.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createCourse } from '../actions';

export default function CreateCoursePage() {
  return (
    <div className="space-y-6">
      <a href="/instructor/courses" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← Kembali</a>
      <h2 className="text-2xl font-headline font-bold">Buat Course Baru</h2>
      <Card>
        <CardHeader><CardTitle>Informasi Course</CardTitle></CardHeader>
        <CardContent>
          <form action={createCourse} className="space-y-4 max-w-lg">
            <Input label="Nama Course" name="title" placeholder="Technical English untuk Kimia" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Deskripsi</label>
              <textarea name="description" rows={4} className="w-full rounded-lg border border-[var(--outline-variant)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" placeholder="Deskripsi course..." />
            </div>
            <Button type="submit">Buat Course</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add "src/app/(dashboard)/instructor/"
git commit -m "feat: add instructor dashboard and course management"
```

---

### Task 12: Material Upload (Instructor)

**Files:**
- Create: `src/app/(dashboard)/instructor/courses/[id]/materials/page.tsx`
- Create: `src/app/(dashboard)/instructor/courses/[id]/materials/upload/page.tsx`
- Create: `src/app/(dashboard)/instructor/courses/[id]/materials/actions.ts`

- [ ] **Step 1: Create material server actions**

Create: `src/app/(dashboard)/instructor/courses/[id]/materials/actions.ts`

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function uploadMaterial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const courseId = formData.get('course_id') as string;
  const title = formData.get('title') as string;
  const type = formData.get('type') as 'pdf' | 'audio' | 'video';

  if (!courseId || !title || !type) return { error: 'Semua field harus diisi' };

  const file = formData.get('file') as File;
  const bucketName = type === 'audio' ? 'audio-materials' : 'course-materials';
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${courseId}/${type}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
  if (uploadError) return { error: `Upload gagal: ${uploadError.message}` };

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  const { error: dbError } = await supabase.from('materials').insert({
    course_id: courseId, title, type, skill_category: formData.get('skill_category') || null, file_url: urlData.publicUrl,
  });
  if (dbError) return { error: `Database error: ${dbError.message}` };
  revalidatePath(`/instructor/courses/${courseId}/materials`);
  return { success: true };
}

export async function deleteMaterial(materialId: string, courseId: string, fileUrl: string) {
  const supabase = await createClient();
  const bucketName = fileUrl.includes('audio') ? 'audio-materials' : 'course-materials';
  const pathParts = fileUrl.split(`${bucketName}/`);
  if (pathParts.length > 1) await supabase.storage.from(bucketName).remove([pathParts[1]]);
  await supabase.from('materials').delete().eq('id', materialId);
  revalidatePath(`/instructor/courses/${courseId}/materials`);
  return { success: true };
}
```

- [ ] **Step 2: Create materials list page**

Create: `src/app/(dashboard)/instructor/courses/[id]/materials/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteMaterial } from './actions';

export default async function InstructorMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: materials } = await supabase.from('materials').select('*').eq('course_id', id).order('created_at', { ascending: false });

  const typeIcons: Record<string, string> = { pdf: 'picture_as_pdf', audio: 'headphones', video: 'smart_display' };
  const typeColors: Record<string, string> = { pdf: 'info', audio: 'warning', video: 'success' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/instructor/courses" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← Kembali</a>
          <h2 className="text-2xl font-headline font-bold mt-2">Materi Course</h2>
        </div>
        <a href={`/instructor/courses/${id}/materials/upload`}>
          <Button><span className="material-symbols-outlined text-sm mr-1">upload_file</span> Upload Materi</Button>
        </a>
      </div>
      <Card>
        <CardContent className="p-0">
          {materials?.length ? (
            <table className="w-full">
              <thead className="bg-[var(--surface-container-low)]">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>Judul</th>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>Tipe</th>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>Kategori</th>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>Tanggal</th>
                  <th className="text-right px-6 py-3 text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {materials.map((mat: any) => (
                  <tr key={mat.id} className="hover:bg-[var(--surface-container-low)]">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>{typeIcons[mat.type]}</span><span className="font-medium">{mat.title}</span></div></td>
                    <td className="px-6 py-4"><Badge variant={typeColors[mat.type] as any}>{mat.type.toUpperCase()}</Badge></td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--on-surface-variant)' }}>{mat.skill_category || '-'}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--on-surface-variant)' }}>{new Date(mat.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => { 'use server'; await deleteMaterial(mat.id, id, mat.file_url); }}>
                        <Button variant="ghost" size="sm" type="submit"><span className="material-symbols-outlined text-[var(--error)]" style={{ fontSize: '20px' }}>delete</span></Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Belum ada materi.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create upload form**

Create: `src/app/(dashboard)/instructor/courses/[id]/materials/upload/page.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadMaterial } from '../actions';

export default async function UploadMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <a href={`/instructor/courses/${id}/materials`} className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← Kembali</a>
      <h2 className="text-2xl font-headline font-bold">Upload Materi</h2>
      <Card>
        <CardHeader><CardTitle>Form Upload</CardTitle></CardHeader>
        <CardContent>
          <form action={uploadMaterial} className="space-y-4 max-w-lg" encType="multipart/form-data">
            <input type="hidden" name="course_id" value={id} />
            <Input label="Judul Materi" name="title" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Tipe File</label>
              <select name="type" required className="rounded-lg border border-[var(--outline-variant)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                <option value="pdf">PDF</option><option value="audio">Audio</option><option value="video">Video</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Kategori Skill</label>
              <select name="skill_category" className="rounded-lg border border-[var(--outline-variant)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                <option value="">Tidak ada</option><option value="listening">Listening</option><option value="reading">Reading</option><option value="writing">Writing</option><option value="technical">Technical English</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">File</label>
              <input name="file" type="file" accept=".pdf,.mp3,.wav,.mp4,.webm" required className="text-sm" />
            </div>
            <Button type="submit">Upload</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/instructor/courses/[id]/materials/"
git commit -m "feat: add material upload and listing for instructors"
```

---

### Task 13: Quiz Management (Instructor)

**Files:**
- Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/page.tsx`
- Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/create/page.tsx`
- Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/[quizId]/edit/page.tsx`
- Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/actions.ts`

- [ ] **Step 1: Create quiz actions**

Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/actions.ts`

```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createQuiz(formData: FormData) {
  const supabase = await createClient();
  const courseId = formData.get('course_id') as string;
  const { error } = await supabase.from('quizzes').insert({
    course_id: courseId,
    title: formData.get('title'),
    duration: parseInt(formData.get('duration') as string),
    passing_grade: parseInt(formData.get('passing_grade') as string) || 70,
    randomize_order: formData.get('randomize_order') === 'on',
    shuffle_answers: formData.get('shuffle_answers') === 'on',
    is_listening: formData.get('is_listening') === 'on',
  });
  if (error) return { error: error.message };
  revalidatePath(`/instructor/courses/${courseId}/quizzes`);
  return { success: true };
}

export async function addQuestion(formData: FormData) {
  const supabase = await createClient();
  const quizId = formData.get('quiz_id') as string;
  const type = formData.get('type') as 'mcq' | 'essay';
  const questionText = formData.get('question_text') as string;
  const audioUrl = formData.get('audio_url') as string | null;

  const { data: question, error } = await supabase.from('questions')
    .insert({ quiz_id: quizId, type, question_text: questionText, audio_url: audioUrl }).select().single();
  if (error) return { error: error.message };

  if (type === 'mcq') {
    const answers = [];
    for (let i = 1; i <= 4; i++) {
      const text = formData.get(`answer_${i}`) as string;
      const isCorrect = formData.get(`answer_${i}_correct`) === 'on';
      if (text) answers.push({ question_id: question.id, answer_text: text, is_correct: isCorrect, sort_order: i - 1 });
    }
    if (answers.length) {
      const { error: ae } = await supabase.from('answers').insert(answers);
      if (ae) return { error: ae.message };
    }
  }
  revalidatePath(`/instructor/courses/0/quizzes/${quizId}/edit`);
  return { success: true };
}
```

- [ ] **Step 2: Create quizzes list**

Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function InstructorQuizzesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quizzes } = await supabase.from('quizzes').select('*').eq('course_id', id).order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/instructor/courses" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← Kembali</a>
          <h2 className="text-2xl font-headline font-bold mt-2">Kelola Quiz</h2>
        </div>
        <a href={`/instructor/courses/${id}/quizzes/create`}>
          <button className="inline-flex items-center bg-[var(--primary)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90">
            <span className="material-symbols-outlined text-sm mr-1">add</span> Buat Quiz
          </button>
        </a>
      </div>
      <div className="space-y-4">
        {quizzes?.map((quiz: any) => (
          <Card key={quiz.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div><CardTitle>{quiz.title}</CardTitle><CardDescription>{quiz.duration} menit • Passing: {quiz.passing_grade}%{quiz.is_listening && ' • Listening'}</CardDescription></div>
              <Badge variant={quiz.is_listening ? 'warning' : 'info'}>{quiz.is_listening ? 'LISTENING' : 'QUIZ'}</Badge>
            </CardHeader>
            <CardContent className="flex gap-2">
              <a href={`/instructor/courses/${id}/quizzes/${quiz.id}/edit`}>
                <button className="inline-flex items-center bg-transparent hover:bg-[var(--surface-container)] text-[var(--on-surface-variant)] rounded-lg px-3 py-1.5 text-sm">Edit Soal</button>
              </a>
              <a href={`/instructor/courses/${id}/submissions?quizId=${quiz.id}`}>
                <button className="inline-flex items-center bg-transparent hover:bg-[var(--surface-container)] text-[var(--on-surface-variant)] rounded-lg px-3 py-1.5 text-sm">
                  <span className="material-symbols-outlined text-sm mr-1">assessment</span> Nilai
                </button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!quizzes?.length) && <p className="text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Belum ada quiz.</p>}
    </div>
  );
}
```

- [ ] **Step 3: Create quiz form**

Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/create/page.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createQuiz } from '../actions';

export default function CreateQuizPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold">Buat Quiz Baru</h2>
      <Card>
        <CardHeader><CardTitle>Informasi Quiz</CardTitle></CardHeader>
        <CardContent>
          <form action={createQuiz} className="space-y-4 max-w-lg">
            <Input label="Judul Quiz" name="title" required />
            <Input label="Durasi (menit)" name="duration" type="number" required />
            <Input label="Passing Grade (%)" name="passing_grade" type="number" defaultValue="70" />
            {[['is_listening', 'Quiz Listening'], ['randomize_order', 'Acak urutan soal'], ['shuffle_answers', 'Acak jawaban']].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2"><input type="checkbox" name={name} className="rounded" /><span className="text-sm">{label}</span></label>
            ))}
            <button type="submit" className="inline-flex items-center bg-[var(--primary)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90">Buat Quiz</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Create quiz edit page**

Create: `src/app/(dashboard)/instructor/courses/[id]/quizzes/[quizId]/edit/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { addQuestion } from '../../actions';

export default async function EditQuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id: courseId, quizId } = await params;
  const supabase = await createClient();
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
  const { data: questions } = await supabase.from('questions').select('*, answers (*)').eq('quiz_id', quizId).order('sort_order', { ascending: true });

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-headline font-bold">{quiz?.title}</h2><p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{questions?.length || 0} soal</p></div>

      {/* Existing questions */}
      <div className="space-y-4">
        {questions?.map((q: any, i: number) => (
          <Card key={q.id}>
            <CardHeader><CardTitle className="text-base font-headline">Soal {i + 1} — {q.type.toUpperCase()}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">{q.question_text}</p>
              {q.answers?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {q.answers.map((a: any) => (
                    <li key={a.id} className={`text-sm ${a.is_correct ? 'text-green-600 font-medium' : ''}`}>
                      {a.is_correct ? '✓' : '○'} {a.answer_text}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add question form */}
      <Card>
        <CardHeader><CardTitle>Tambah Soal Baru</CardTitle></CardHeader>
        <CardContent>
          <form action={addQuestion} className="space-y-4">
            <input type="hidden" name="quiz_id" value={quizId} />
            <Input label="Pertanyaan" name="question_text" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Tipe Soal</label>
              <select name="type" required className="rounded-lg border border-[var(--outline-variant)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                <option value="mcq">Pilihan Ganda</option><option value="essay">Essay</option>
              </select>
            </div>
            <Input label="URL Audio (opsional)" name="audio_url" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Jawaban</p>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <Input label={`Jawaban ${n}`} name={`answer_${n}`} className="flex-1" />
                  <label className="flex items-center gap-1 text-sm"><input type="checkbox" name={`answer_${n}_correct`} /> Benar</label>
                </div>
              ))}
            </div>
            