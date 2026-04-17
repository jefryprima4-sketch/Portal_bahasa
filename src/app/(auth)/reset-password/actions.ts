'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email wajib diisi.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
  });

  if (error) return { error: error.message };
  return { success: true };
}
