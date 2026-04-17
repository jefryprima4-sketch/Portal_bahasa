'use server';

import { createClient } from '@/lib/supabase/server';
import { verifyAttendanceToken } from '@/lib/attendance-utils';
import { revalidatePath } from 'next/cache';

export async function recordAttendance(token: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Verify token (HMAC-signed, async)
  const verified = await verifyAttendanceToken(token);
  if (!verified) {
    return { success: false, message: 'Invalid or expired QR code.' };
  }

  const { courseId } = verified;

  // 2. Check if student is enrolled in the course
  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enroll')
    .select('id')
    .eq('course_id', courseId)
    .eq('student_id', user.id)
    .single();

  if (enrollError || !enrollment) {
    return { success: false, message: 'You are not enrolled in this course.' };
  }

  // 3. Check if already marked present today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: existing, error: existError } = await supabase
    .from('attendance')
    .select('id')
    .eq('course_id', courseId)
    .eq('student_id', user.id)
    .gte('timestamp', today.toISOString())
    .maybeSingle();

  if (existing) {
    return { success: false, message: 'You have already been marked present for today.' };
  }

  // 4. Record attendance
  const { error: insertError } = await supabase
    .from('attendance')
    .insert({
      course_id: courseId,
      student_id: user.id,
      method: 'qr'
    });

  if (insertError) {
    return { success: false, message: 'Failed to record attendance. Please try again.' };
  }

  revalidatePath('/student/attendance');
  return { success: true, message: 'Attendance recorded successfully!' };
}
