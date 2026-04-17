import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function InstructorQuizzesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: quizzes } = await supabase.from('quizzes').select('*').eq('course_id', id).order('created_at', { ascending: false });

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto font-body">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <a href="/instructor/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Kembali ke Daftar Kursus
          </a>
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Kelola Kuis</h2>
        </div>
        <a href={`/instructor/courses/${id}/quizzes/create`}>
          <Button className="h-14 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all font-black text-base">
            <span className="material-symbols-outlined mr-2">add</span>
            Buat Kuis
          </Button>
        </a>
      </section>

      <div className="space-y-4">
        {quizzes?.map((quiz: any) => (
          <div key={quiz.id} className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8 group hover:translate-x-2 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-headline font-bold text-xl text-slate-900">{quiz.title}</h3>
                  <Badge variant={quiz.is_listening ? 'warning' : 'info'}>{quiz.is_listening ? 'LISTENING' : 'KUIS'}</Badge>
                </div>
                <p className="text-sm text-slate-500 font-medium">{quiz.duration} menit • Kelulusan: {quiz.passing_grade}%{quiz.is_listening && ' • Listening'}</p>
              </div>
              <div className="flex items-center gap-3">
                <a href={`/instructor/courses/${id}/quizzes/${quiz.id}/edit`}>
                  <Button variant="outline" className="rounded-xl">
                    <span className="material-symbols-outlined text-sm mr-2">edit</span>
                    Edit Soal
                  </Button>
                </a>
                <a href={`/instructor/courses/${id}/submissions?quizId=${quiz.id}`}>
                  <Button className="rounded-xl shadow-lg">
                    <span className="material-symbols-outlined text-sm mr-2">assessment</span>
                    Nilai
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!quizzes || quizzes.length === 0) && (
        <div className="py-20 bg-white rounded-[2rem] whisper-shadow border border-slate-50 text-center space-y-6">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl text-slate-200">quiz</span>
          </div>
          <p className="text-slate-400 font-medium">Belum ada kuis. Klik "Buat Kuis" untuk memulai.</p>
        </div>
      )}
    </div>
  );
}
