import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createQuiz } from '../actions';

export default async function CreateQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-4xl mx-auto font-body">
      <section className="space-y-1">
        <a href={`/instructor/courses/${courseId}/quizzes`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Daftar Kuis
        </a>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Buat Kuis Baru</h2>
        <p className="text-on-surface-variant font-medium">Tambahkan evaluasi baru untuk kursus Anda.</p>
      </section>

      <div className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined">quiz</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-slate-900">Informasi Kuis</h3>
        </div>

        <form action={createQuiz} className="space-y-5 max-w-lg">
          <input type="hidden" name="course_id" value={courseId} />
          <Input label="Judul Kuis" name="title" type="text" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Durasi (menit)" name="duration" type="number" required />
            <Input label="Nilai Minimum Kelulusan (%)" name="passing_grade" type="number" defaultValue="70" />
          </div>
          <Input label="Maksimal Percobaan" name="max_attempts" type="number" defaultValue="1" min={1} max={10} />
          {[['is_listening', 'Kuis Listening'], ['randomize_order', 'Acak urutan soal'], ['shuffle_answers', 'Acak jawaban']].map(([name, label]) => (
            <label key={name} className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" name={name} className="rounded text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
          <Button type="submit" className="rounded-xl shadow-lg px-8">
            <span className="material-symbols-outlined text-sm mr-2">add</span>
            Buat Kuis
          </Button>
        </form>
      </div>
    </div>
  );
}
