'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function gradeSubmission(
  courseId: string,
  submissionId: string,
  score: number,
  feedback: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Verify instructor ownership of the course
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single();

  if (!course || course.instructor_id !== user.id) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('submissions')
    .update({
      score,
      feedback,
      is_manually_graded: true
    })
    .eq('id', submissionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/instructor/courses/${courseId}/submissions/${submissionId}`);
  revalidatePath(`/instructor/courses/${courseId}/submissions`);
}
