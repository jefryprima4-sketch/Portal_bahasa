'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function verifyCourseAccess(courseId: string, userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from('users').select('role').eq('id', userId).single();
  if (profile?.role === 'admin') return true;

  const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single();
  if (!course || course.instructor_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke kursus ini.');
  }
  return true;
}

export async function createQuiz(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const courseId = formData.get('course_id') as string;
  await verifyCourseAccess(courseId, user.id);

  const { error } = await supabase.from('quizzes').insert({
    course_id: courseId,
    title: formData.get('title'),
    duration: parseInt(formData.get('duration') as string),
    passing_grade: parseInt(formData.get('passing_grade') as string) || 70,
    max_attempts: parseInt(formData.get('max_attempts') as string) || 1,
    randomize_order: formData.get('randomize_order') === 'on',
    shuffle_answers: formData.get('shuffle_answers') === 'on',
    is_listening: formData.get('is_listening') === 'on',
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/instructor/courses/${courseId}/quizzes`);
}

export async function addQuestion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const quizId = formData.get('quiz_id') as string;
  const courseId = formData.get('course_id') as string;
  await verifyCourseAccess(courseId, user.id);

  const type = formData.get('type') as 'mcq' | 'essay' | 'speaking';
  const questionText = formData.get('question_text') as string;
  const audioUrl = formData.get('audio_url') as string | null;

  const { data: question, error } = await supabase.from('questions')
    .insert({ quiz_id: quizId, type, question_text: questionText, audio_url: audioUrl }).select().single();
  if (error) throw new Error(error.message);

  if (type === 'mcq') {
    const answers: { question_id: string; answer_text: string; is_correct: boolean; sort_order: number }[] = [];
    for (let i = 1; i <= 4; i++) {
      const text = formData.get(`answer_${i}`) as string;
      const isCorrect = formData.get(`answer_${i}_correct`) === 'on';
      if (text) answers.push({ question_id: question.id, answer_text: text, is_correct: isCorrect, sort_order: i - 1 });
    }
    if (answers.length) {
      const { error: ae } = await supabase.from('answers').insert(answers);
      if (ae) throw new Error(ae.message);
    }
  }

  revalidatePath(`/instructor/courses/${courseId}/quizzes/${quizId}/edit`);
}

export async function deleteQuestion(questionId: string, quizId: string, courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await verifyCourseAccess(courseId, user.id);

  const { error } = await supabase.from('questions').delete().eq('id', questionId);
  if (error) throw new Error(error.message);
  revalidatePath(`/instructor/courses/${courseId}/quizzes/${quizId}/edit`);
}
