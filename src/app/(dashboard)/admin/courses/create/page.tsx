import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createCourse } from '@/app/(dashboard)/instructor/courses/actions';

export default async function AdminCreateCoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin');

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-4xl mx-auto font-body">
      <section className="space-y-1">
        <a href="/admin/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Daftar Kursus
        </a>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Buat Kursus Baru</h2>
        <p className="text-on-surface-variant font-medium">Buat kursus baru dan tetapkan ke dosen pengampu.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">add_card</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-slate-900">Informasi Kursus</h3>
          </div>
          <form action={createCourse} className="space-y-6">
            <Input
              label="Nama Kursus"
              name="title"
              placeholder="Contoh: Technical English untuk Kimia"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Deskripsi Kursus</label>
              <textarea
                name="description"
                rows={6}
                className="w-full rounded-xl border border-slate-100 px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y bg-slate-50/30"
                placeholder="Jelaskan tujuan pembelajaran dan garis besar materi..."
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="rounded-xl shadow-lg px-10 h-11">
                Konfirmasi & Buat Kursus
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-primary text-white p-6 rounded-[2rem] shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <h4 className="font-headline font-bold text-lg">Mode Admin</h4>
            <p className="text-xs opacity-90 leading-relaxed">
              Kursus yang dibuat admin akan otomatis ditugaskan ke akun Anda. Anda bisa mengubah dosen pengampu setelah kursus dibuat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
