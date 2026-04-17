-- 1. Add 'speaking' to question_type enum
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'speaking';

-- 2. Add 'speaking' to skill_category enum
DO $$ BEGIN
  ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'speaking';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Note on answers.is_correct security:
-- The answers_select RLS policy currently uses USING (true), meaning all authenticated
-- users can read is_correct. This is needed because the server-side submitQuiz action
-- runs with the student's auth context and needs is_correct for auto-scoring MCQs.
-- App-layer protection is in place: the student quiz page does NOT select is_correct,
-- and the quiz page query explicitly omits it. A future improvement could use a
-- Supabase Edge Function or service_role key for scoring to allow tightening RLS.
