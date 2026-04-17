'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/supabase/types';

export async function createUser(formData: FormData) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) redirect('/login');

  // Verify admin role
  const { data: adminProfile } = await supabase.from('users').select('role').eq('id', adminUser.id).single();
  if (adminProfile?.role !== 'admin') redirect('/admin');

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const nim_nip = formData.get('nim_nip') as string;
  const role = formData.get('role') as UserRole;

  if (!email || !password || !name || !role) redirect('/admin/users?error=Semua%20field%20harus%20diisi');

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, nim_nip, role } },
  });
  if (error) redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);

  // Explicitly insert into users table (in case trigger doesn't exist)
  if (data.user) {
    const { error: profileError } = await supabase.from('users').upsert({
      id: data.user.id,
      name,
      email,
      nim_nip: nim_nip || '',
      role,
    }, { onConflict: 'id' });

    if (profileError) {
      console.error('Failed to create user profile:', profileError.message);
    }
  }

  revalidatePath('/admin/users');
  redirect('/admin/users?success=true');
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return { error: 'Not authenticated' };

  // Verify admin role
  const { data: adminProfile } = await supabase.from('users').select('role').eq('id', adminUser.id).single();
  if (adminProfile?.role !== 'admin') return { error: 'Unauthorized' };

  const { error } = await supabase.from('users').update({ role }).eq('id', userId);
  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}
