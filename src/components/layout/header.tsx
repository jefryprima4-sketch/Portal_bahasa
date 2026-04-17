'use client';

import { logout } from '@/app/(auth)/login/actions';
import type { UserRole } from '@/lib/supabase/types';

interface HeaderProps { userName: string; userRole: UserRole; }

export function Header({ userName, userRole }: HeaderProps) {
  const roleLabels: Record<UserRole, string> = { student: 'Akun Mahasiswa', instructor: 'Akun Dosen', admin: 'Admin Sistem' };

  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl h-24 whisper-shadow px-8 lg:px-12 flex items-center justify-between border-b border-white/20">
      <div className="flex items-center gap-6">
        <a href={userRole === 'admin' ? '/admin' : `/${userRole}/dashboard`} className="flex flex-col hover:opacity-70 transition-opacity">
          <h1 className="text-xl font-headline font-black text-slate-900 tracking-tighter italic leading-none flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">dashboard</span>
            Portal <span className="text-primary italic">Bahasa</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1.5 ml-8">
            {roleLabels[userRole]} : <span className="text-slate-600 font-bold">{userName}</span>
          </p>
        </a>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-8 w-px bg-slate-100 hidden sm:block" />

        <form action={logout}>
          <button type="submit" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg font-black">logout</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500 transition-colors hidden sm:block">Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
