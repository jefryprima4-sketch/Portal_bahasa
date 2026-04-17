import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizPlayer } from '@/components/quiz/quiz-player';

// Seeded pseudo-random shuffle (deterministic per quiz+student)
function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = result.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash) + i;
    hash |= 0;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Get quiz data and verify enrollment
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*, courses(id)')
    .eq('id', quizId)
    .single();

  if (!quiz) redirect('/student/dashboard');

  const { data: enrollment } = await supabase
    .from('course_enroll')
    .select('*')
    .eq('course_id', quiz.courses.id)
    .eq('student_id', user.id)
    .single();

  if (!enrollment) redirect(`/student/courses/${quiz.courses.id}`);

  // 2. Check if already submitted (respect max_attempts)
  const { count: attemptCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', quizId)
    .eq('student_id', user.id)
    .eq('status', 'submitted');

  if (attemptCount !== null && attemptCount >= (quiz.max_attempts || 1)) {
    redirect(`/student/quizzes/${quizId}/results`);
  }

  // 3. Get questions (without is_correct to prevent answer leakage)
  const { data: questions } = await supabase
    .from('questions')
    .select('id, type, question_text, audio_url, sort_order, answers(id, answer_text, sort_order)')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true });

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <p className="text-[var(--on-surface-variant)]">Kuis ini belum memiliki soal. Silakan hubungi dosen Anda.</p>
      </div>
    );
  }

  // 4. Apply randomization if enabled
  const seed = `${quizId}-${user.id}`;
  let processedQuestions = questions.map(q => ({
    ...q,
    answers: (q.answers as any[]).sort((a, b) => a.sort_order - b.sort_order),
  }));

  if (quiz.randomize_order) {
    processedQuestions = seededShuffle(processedQuestions, seed);
  }

  if (quiz.shuffle_answers) {
    processedQuestions = processedQuestions.map(q => ({
      ...q,
      answers: seededShuffle(q.answers, `${seed}-${q.id}`),
    }));
  }

  // 5. Render Quiz Player
  return (
    <div className="space-y-6">
      <QuizPlayer
        quiz={quiz}
        questions={processedQuestions}
      />
    </div>
  );
}
