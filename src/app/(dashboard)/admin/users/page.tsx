import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/lib/supabase/types';
import { createUser } from './actions';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });

  const roleColors: Record<UserRole, 'info' | 'warning' | 'error'> = {
    student: 'info',
    instructor: 'warning',
    admin: 'error',
  };

  const roleLabels: Record<UserRole, string> = {
    student: 'Mahasiswa', instructor: 'Dosen', admin: 'Admin',
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto font-body">
      <section className="space-y-1">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Manajemen User</h2>
        <p className="text-on-surface-variant font-medium">Kelola akun mahasiswa, dosen, dan admin sistem.</p>
      </section>

      {/* Add User Form */}
      <div className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-slate-900">Tambah User Baru</h3>
        </div>
        <form action={createUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <input name="name" type="text" placeholder="Nama Lengkap" className="rounded-xl border border-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50/30" required />
          <input name="email" type="email" placeholder="Email Institusi" className="rounded-xl border border-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50/30" required />
          <input name="password" type="password" placeholder="Password" className="rounded-xl border border-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50/30" required />
          <input name="nim_nip" type="text" placeholder="NIM/NIP" className="rounded-xl border border-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50/30" />
          <select name="role" className="rounded-xl border border-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50/30" required>
            <option value="student">Mahasiswa</option>
            <option value="instructor">Dosen</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit" className="h-[46px] rounded-xl shadow-lg font-bold">
            <span className="material-symbols-outlined text-sm mr-2">add</span>
            Tambah User
          </Button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden whisper-shadow border border-slate-50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-500">
              <th className="px-8 py-5">Nama</th>
              <th className="px-8 py-5">Email</th>
              <th className="px-8 py-5">NIM/NIP</th>
              <th className="px-8 py-5">Peran</th>
              <th className="px-8 py-5">Terdaftar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users?.map((user: any) => (
              <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                      {user.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600">{user.email}</td>
                <td className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">{user.nim_nip}</td>
                <td className="px-8 py-5">
                  <Badge variant={roleColors[user.role as UserRole]}>{roleLabels[user.role as UserRole] || user.role}</Badge>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-200 mb-4 block">people</span>
            <p className="text-slate-400 font-medium">Belum ada user terdaftar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
