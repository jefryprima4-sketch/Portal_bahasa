'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function register(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const nim = formData.get('nim') as string;

  if (!name || !email || !password || !nim) redirect('/register?error=Semua%20field%20harus%20diisi');
  if (password.length < 8) redirect('/register?error=Password%20minimal%208%20karakter');
  if (password !== passwordConfirm) redirect('/register?error=Password%20tidak%20cocok');
  if (!/^\d{8,10}$/.test(nim)) redirect('/register?error=NIM%20harus%20berupa%20angka%208-10%20digit');

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, nim_nip: nim, role: 'student' } },
  });
  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/', 'layout');

  // If email confirmation is required, redirect to verify-email page
  if (data.user && !data.session) {
    redirect('/verify-email?email=' + encodeURIComponent(email));
  }

  redirect('/');
}
