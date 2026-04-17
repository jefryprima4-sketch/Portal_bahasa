import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateCourse } from '../../actions';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: course } = await supabase.from('courses').select('*').eq('id', id).single();
  if (!course) redirect('/instructor/courses');

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-4xl mx-auto font-body">
      <section className="space-y-1">
        <a href="/instructor/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Daftar Kursus
        </a>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Edit Detail Kursus</h2>
        <p className="text-on-surface-variant font-medium">Perbarui informasi tentang kursus Anda.</p>
      </section>

      <div className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">edit_square</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-slate-900">Informasi Kursus</h3>
        </div>

        <form action={updateCourse} className="space-y-6 max-w-lg">
          <input type="hidden" name="id" value={id} />
          <Input
            label="Nama Kursus"
            name="title"
            defaultValue={course.title}
            placeholder="Contoh: Technical English untuk Kimia"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-body">Deskripsi</label>
            <textarea
              name="description"
              defaultValue={course.description || ''}
              rows={5}
              className="w-full rounded-xl border border-slate-100 px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y bg-slate-50/30"
              placeholder="Jelaskan apa yang akan dipelajari di kursus ini..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="rounded-xl shadow-lg">Simpan Perubahan</Button>
            <a href="/instructor/courses">
              <Button variant="outline" type="button" className="rounded-xl">Batal</Button>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
