import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/supabase/types';

export default async function DashboardRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  const role = (profile?.role || 'student') as UserRole;

  const dashboardPath = role === 'admin' ? '/admin' : `/${role}/dashboard`;
  redirect(dashboardPath);
}
