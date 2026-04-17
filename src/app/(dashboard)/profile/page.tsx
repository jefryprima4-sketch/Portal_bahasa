import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logout } from '@/app/(auth)/login/actions';
import type { UserRole } from '@/lib/supabase/types';

const roleLabels: Record<UserRole, string> = { student: 'Mahasiswa', instructor: 'Dosen', admin: 'Admin' };
const roleColors: Record<UserRole, { bg: string; text: string }> = {
  student: { bg: 'bg-blue-50', text: 'text-blue-700' },
  instructor: { bg: 'bg-green-50', text: 'text-green-700' },
  admin: { bg: 'bg-red-50', text: 'text-red-700' },
};

async function updateProfile(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const name = formData.get('name') as string;
  if (!name?.trim()) return;
  await supabase.from('users').update({ name: name.trim() }).eq('id', user.id);
  redirect('/profile');
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!profile) redirect('/login');

  const initials = (profile.name as string)?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || '?';
  const role = profile.role as UserRole;

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-3xl mx-auto font-body">
      <section className="space-y-1">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Profil Saya</h2>
        <p className="text-on-surface-variant font-medium">Kelola informasi akun dan preferensi Anda.</p>
      </section>

      {/* Avatar & Info Card */}
      <div className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-2xl font-headline font-bold text-white shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-headline font-bold text-slate-900">{profile.name}</h3>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${roleColors[role].bg} ${roleColors[role].text}`}>
              {roleLabels[role]}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">edit</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-slate-900">Edit Profil</h3>
        </div>

        <form action={updateProfile} className="space-y-5">
          <Input label="Nama Lengkap" name="name" defaultValue={profile.name} required minLength={3} className="h-12 rounded-xl" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400">Email (tidak bisa diubah)</p>
              <div className="px-4 py-3 bg-slate-50/50 rounded-xl text-sm text-slate-500 font-medium border border-slate-100">{profile.email}</div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400">NIM/NIP (tidak bisa diubah)</p>
              <div className="px-4 py-3 bg-slate-50/50 rounded-xl text-sm text-slate-500 font-medium border border-slate-100">{profile.nim_nip}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl text-blue-700 text-sm">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            Terdaftar sejak {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <Button type="submit" className="rounded-xl shadow-lg">
            <span className="material-symbols-outlined text-sm mr-1">save</span>
            Simpan Perubahan
          </Button>
        </form>
      </div>

      {/* Security Tips */}
      <div className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-slate-900">Tips Keamanan</h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-500 font-medium pl-2">
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-1">•</span> Gunakan password minimal 8 karakter dengan campuran huruf dan angka</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-1">•</span> Jangan bagikan akun Anda dengan orang lain</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-1">•</span> Jika lupa password, hubungi Admin atau gunakan fitur Lupa Password</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-1">•</span> Verifikasi email Anda untuk akses penuh ke sistem</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <form action={logout}>
          <Button variant="outline" type="submit" className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100">
            <span className="material-symbols-outlined text-sm mr-1">logout</span> Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}
