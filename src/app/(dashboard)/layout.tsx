import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import type { UserRole } from '@/lib/supabase/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile) redirect('/onboarding');

  const role = profile.role as UserRole;
  const name = profile.name as string;

  return (
    <div className="min-h-screen">
      <Sidebar role={role} userName={name} />
      <div className="lg:ml-72 min-h-screen">
        <Header userName={name} userRole={role} />
        <main className="p-8 lg:p-12">{children}</main>
      </div>
    </div>
  );
}
