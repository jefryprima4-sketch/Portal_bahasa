import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Determine dashboard URL based on role
  let dashboardHref = '/student/dashboard';
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    const role = profile?.role;
    if (role === 'admin') dashboardHref = '/admin';
    else if (role === 'instructor') dashboardHref = '/instructor/dashboard';
  }

  return (
    <div className="min-h-screen bg-surface font-body selection:bg-primary/10">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <span className="text-lg font-headline font-bold text-blue-900 tracking-tight">Portal Bahasa</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href={dashboardHref}>
                <Button className="rounded-lg px-5">Ke Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Masuk</Link>
                <Link href="/register">
                  <Button className="rounded-lg px-6">Daftar Sekarang</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-slate-900 leading-tight tracking-tight">
            Portal Pembelajaran Bahasa <span className="text-primary">PTKI Medan</span>
          </h1>

          <p className="max-w-xl mx-auto text-base text-slate-500 leading-relaxed">
            Platform ujian berbasis komputer (CBT) untuk kemahiran berbahasa. Dilengkapi modul Listening, bank soal MCQ, dan pelacakan progres real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 rounded-lg text-base">Mulai Belajar</Button>
            </Link>
            <a href="#fitur">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-lg text-base">Lihat Fitur</Button>
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <section id="fitur" className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-lg w-fit text-primary mb-4">
              <span className="material-symbols-outlined text-2xl">headphones</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-slate-900 mb-2">Modul Listening Terintegrasi</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Kuis listening dengan audio streaming langsung, tanpa perlu mengunduh file. Didukung timer dan auto-grading.</p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-lg w-fit text-primary mb-4">
              <span className="material-symbols-outlined text-2xl">quiz</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-slate-900 mb-2">CBT & Penilaian Otomatis</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Hasil kuis tampil seketika setelah submit. Penilaian objektif otomatis dan feedback langsung untuk mahasiswa.</p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-lg w-fit text-primary mb-4">
              <span className="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-slate-900 mb-2">Pelacakan Progres</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Dashboard statistik real-time untuk memantau perkembangan belajar, nilai rata-rata, dan status kehadiran.</p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-blue-50 rounded-lg w-fit text-primary mb-4">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-slate-900 mb-2">Keamanan Standar Akademik</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Proteksi data nilai dan submisi dengan kebijakan akses berbasis peran (RBAC) dan enkripsi tingkat lanjut.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">school</span>
            </div>
            <span className="font-headline font-bold text-slate-900">Portal Bahasa PTKI Medan</span>
          </div>
          <p className="text-xs text-slate-400">&copy; 2026 PTKI Medan. Hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
