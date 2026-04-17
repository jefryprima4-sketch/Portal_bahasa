'use server';

import { createClient } from '@/lib/supabase/server';

export async function resendVerificationEmail(email?: string) {
  const supabase = await createClient();
  if (!email) throw new Error('Email is required');
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw new Error(error.message);
}
