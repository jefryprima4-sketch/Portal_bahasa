'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function uploadMaterial(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const courseId = formData.get('course_id') as string;
  const title = formData.get('title') as string;
  const type = formData.get('type') as 'pdf' | 'audio' | 'video';
  const skillCategory = formData.get('skill_category') as string | null;
  const file = formData.get('file') as File;

  if (!courseId || !title || !type || !file) throw new Error('Semua field harus diisi');

  // Verify instructor owns this course (or is admin)
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single();
    if (!course || course.instructor_id !== user.id) {
      throw new Error('Anda tidak memiliki akses ke kursus ini.');
    }
  }

  const bucketName = type === 'audio' ? 'audio-materials' : 'course-materials';
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${courseId}/${type}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
  if (uploadError) throw new Error(`Upload gagal: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  const { error: dbError } = await supabase.from('materials').insert({
    course_id: courseId, title, type, skill_category: skillCategory || null, file_url: publicUrl,
  });
  if (dbError) throw new Error(`Database error: ${dbError.message}`);

  revalidatePath(`/instructor/courses/${courseId}/materials`);
}

export async function deleteMaterial(materialId: string, courseId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify ownership or admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single();
    if (!course || course.instructor_id !== user.id) {
      throw new Error('Anda tidak memiliki akses ke kursus ini.');
    }
  }

  const bucketName = fileUrl.includes('audio') ? 'audio-materials' : 'course-materials';
  const pathParts = fileUrl.split(`${bucketName}/`);
  if (pathParts.length > 1) await supabase.storage.from(bucketName).remove([pathParts[1]]);
  await supabase.from('materials').delete().eq('id', materialId);
  revalidatePath(`/instructor/courses/${courseId}/materials`);
}
