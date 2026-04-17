'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function enrollCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('course_enroll').insert({
    course_id: courseId,
    student_id: user.id
  });

  if (error) {
    if (error.code === '23505') return { success: true }; // Already enrolled
    throw new Error(error.message);
  }

  revalidatePath(`/student/courses/${courseId}`);
  return { success: true };
}

export async function recordMaterialView(courseId: string, materialId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('material_views').upsert({
    student_id: user.id,
    material_id: materialId
  }, { onConflict: 'student_id,material_id' });

  if (!error) {
    revalidatePath(`/student/courses/${courseId}`);
  }
}
