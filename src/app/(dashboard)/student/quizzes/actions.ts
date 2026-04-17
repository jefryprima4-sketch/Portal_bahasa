'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function submitQuiz(quizId: string, answers: Record<string, string>, tabSwitchCount: number = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Get quiz info including max_attempts
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, max_attempts')
    .eq('id', quizId)
    .single();

  if (!quiz) throw new Error('Quiz not found');

  // 2. Check max_attempts - count existing submissions
  const { count: attemptCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', quizId)
    .eq('student_id', user.id)
    .eq('status', 'submitted');

  if (attemptCount !== null && attemptCount >= (quiz.max_attempts || 1)) {
    redirect(`/student/quizzes/${quizId}/results`);
  }

  // 3. Get questions and correct answers
  const { data: questions } = await supabase
    .from('questions')
    .select('id, type, answers(id, is_correct)')
    .eq('quiz_id', quizId);

  if (!questions || questions.length === 0) throw new Error('Questions not found');

  // 4. Calculate score and prepare submission_answers
  let correctCount = 0;
  const submissionAnswers = [];

  for (const question of questions) {
    const rawAnswer = answers[question.id];
    if (!rawAnswer) continue;

    const isUrl = rawAnswer.startsWith('http');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawAnswer);

    submissionAnswers.push({
      question_id: question.id,
      answer_id: isUuid ? rawAnswer : null,
      answer_text: (!isUuid || isUrl) ? rawAnswer : null,
    });

    const correctAnswer = question.answers?.find((a: any) => a.is_correct);
    if (isUuid && rawAnswer === correctAnswer?.id) {
      correctCount++;
    }
  }

  // Score only counts MCQ questions
  const mcqQuestions = questions.filter(q => q.type === 'mcq');
  const score = mcqQuestions.length > 0 ? Math.round((correctCount / mcqQuestions.length) * 100) : 0;

  // 5. Save Submission (handle duplicate with unique constraint)
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .insert({
      quiz_id: quizId,
      student_id: user.id,
      score,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      tab_switch_count: tabSwitchCount
    })
    .select()
    .single();

  if (subError) {
    // If duplicate submission (23505 unique violation), redirect to results
    if (subError.code === '23505') {
      redirect(`/student/quizzes/${quizId}/results`);
    }
    throw new Error(subError.message);
  }

  // 6. Save Answer Details
  const detailAnswers = submissionAnswers.map(sa => ({
    submission_id: submission.id,
    ...sa
  }));

  const { error: detailError } = await supabase
    .from('submission_answers')
    .insert(detailAnswers);

  if (detailError) throw new Error(detailError.message);

  // 7. Revalidate and Redirect
  revalidatePath(`/student/quizzes/${quizId}/results`);
  redirect(`/student/quizzes/${quizId}/results`);
}
