'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { UserRole } from '@/lib/supabase/types';

interface SidebarProps {
  role: UserRole;
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems: Record<UserRole, { label: string; href: string; icon: string }[]> = {
    student: [
      { label: 'Dashboard', href: '/student/dashboard', icon: 'dashboard' },
      { label: 'Kursus Saya', href: '/student/courses', icon: 'menu_book' },
      { label: 'Cari Kursus', href: '/student/explore', icon: 'search' },
      { label: 'Kehadiran', href: '/student/attendance', icon: 'qr_code_scanner' },
      { label: 'Profil', href: '/profile', icon: 'person' },
    ],
    instructor: [
      { label: 'Dashboard', href: '/instructor/dashboard', icon: 'dashboard' },
      { label: 'Kelola Kursus', href: '/instructor/courses', icon: 'menu_book' },
      { label: 'Kehadiran', href: '/instructor/attendance', icon: 'qr_code_scanner' },
      { label: 'Profil', href: '/profile', icon: 'person' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
      { label: 'Kelola User', href: '/admin/users', icon: 'people' },
      { label: 'Kelola Kursus', href: '/admin/courses', icon: 'menu_book' },
      { label: 'Pengaturan', href: '/admin/settings', icon: 'settings' },
      { label: 'Profil', href: '/profile', icon: 'person' },
    ],
  };

  const roleLabels: Record<UserRole, string> = {
    student: 'Mahasiswa', instructor: 'Dosen', admin: 'Admin',
  };

  const sidebarContent = (
    <>
      <Link href={role === 'admin' ? '/admin' : `/${role}/dashboard`} className="flex items-center gap-3 px-2 mb-10 hover:opacity-80 transition-opacity" onClick={() => setMobileOpen(false)}>
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm overflow-hidden">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">Portal Bahasa</h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{roleLabels[role]}</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems[role].map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-lg
                ${isActive
                  ? 'bg-white text-blue-700 shadow-soft translate-x-1 font-bold'
                  : 'text-slate-600 hover:bg-slate-200/50'
                }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 mt-auto"
      >
        <span className="material-symbols-outlined">logout</span>
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-6 left-4 z-50 w-10 h-10 rounded-xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-72 h-screen bg-slate-50 border-r border-slate-100 flex-col p-6 gap-y-2 font-headline font-medium z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-slate-50 border-r border-slate-100 flex flex-col p-6 gap-y-2 font-headline font-medium shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
