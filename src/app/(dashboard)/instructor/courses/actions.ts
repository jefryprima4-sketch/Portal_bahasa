'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function verifyInstructorOwnership(courseId: string, userId: string) {
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single();

  if (!course || course.instructor_id !== userId) {
    throw new Error('Anda tidak memiliki akses ke kursus ini.');
  }
  return true;
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  if (!title) throw new Error('Judul wajib diisi');

  const { error: insertError } = await supabase.from('courses').insert({
    title,
    description,
    instructor_id: user.id,
  });

  if (insertError) throw new Error(insertError.message);

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

  revalidatePath('/instructor/courses');
  revalidatePath('/admin/courses');

  if (profile?.role === 'admin') {
    redirect('/admin/courses');
  } else {
    redirect('/instructor/courses');
  }
}

export async function updateCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!id || !title) throw new Error('ID dan Judul wajib diisi');

  // Verify ownership or admin role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    await verifyInstructorOwnership(id, user.id);
  }

  const { error } = await supabase.from('courses').update({ title, description }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/instructor/courses');
  revalidatePath('/admin/courses');
  redirect('/instructor/courses');
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify ownership or admin role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    await verifyInstructorOwnership(courseId, user.id);
  }

  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) throw new Error(error.message);
  revalidatePath('/instructor/courses');
  revalidatePath('/admin/courses');
}
