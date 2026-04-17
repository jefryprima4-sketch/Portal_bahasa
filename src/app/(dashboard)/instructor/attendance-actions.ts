'use server';

import { generateAttendanceToken } from '@/lib/attendance-utils';
import { createClient } from '@/lib/supabase/server';

export async function generateQrToken(courseId: string): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify the instructor owns this course
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single();

  if (!course || course.instructor_id !== user.id) {
    return { error: 'You are not the instructor of this course.' };
  }

  const token = await generateAttendanceToken(courseId);
  return { token };
}
