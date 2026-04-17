'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!email || !password) redirect('/login?error=Email%20dan%20password%20harus%20diisi');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  // Redirect based on user role
  const { data: profile } = await supabase.from('users').select('role').eq('id', (await supabase.auth.getUser()).data.user?.id).single();
  const role = profile?.role || 'student';
  const destination = role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';

  revalidatePath('/', 'layout');
  redirect(destination);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
