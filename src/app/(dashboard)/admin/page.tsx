import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).single();

  const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: instructorCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'instructor');
  const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
  const { count: submissionCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });

  const stats = [
    { label: 'Total Mahasiswa', value: studentCount || 0, icon: 'people', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Dosen', value: instructorCount || 0, icon: 'badge', color: 'bg-green-50 text-green-600' },
    { label: 'Course Aktif', value: courseCount || 0, icon: 'menu_book', color: 'bg-purple-50 text-purple-600' },
    { label: 'Submisi Kuis', value: submissionCount || 0, icon: 'assignment', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <section className="space-y-1">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Dashboard Admin</h2>
        <p className="text-on-surface-variant font-medium">Selamat datang, {profile?.name?.split(' ')[0] || 'Admin'}! Kelola sistem Portal Bahasa dari sini.</p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-6 rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col justify-between h-36">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{s.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-headline font-black text-primary tracking-tighter">{s.value}</span>
              <span className={`material-symbols-outlined text-4xl ${s.color.replace('bg-', 'text-').replace(/text-(\w+)-\d+/, 'text-$1-100')}`}>{s.icon}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/admin/users" className="bg-white p-8 rounded-[2rem] whisper-shadow border border-slate-50 group hover:translate-x-2 transition-all flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined">people</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Kelola User</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Tambah, edit, dan atur peran pengguna sistem.</p>
          </div>
        </a>

        <a href="/admin/courses" className="bg-white p-8 rounded-[2rem] whisper-shadow border border-slate-50 group hover:translate-x-2 transition-all flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Kelola Course</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Pantau dan kelola seluruh kurikulum pembelajaran.</p>
          </div>
        </a>
      </section>
    </div>
  );
}
