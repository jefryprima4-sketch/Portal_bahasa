import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: quiz } = await supabase.from('quizzes').select('*, courses(id, title)').eq('id', quizId).single();
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('student_id', user.id)
    .single();

  if (!submission || !quiz) redirect(`/student/dashboard`);

  const isPassed = submission.score >= quiz.passing_grade;

  return (
    <div className="min-h-screen bg-surface font-body py-20 px-8">
      <div className="max-w-xl mx-auto space-y-12">
        {/* Header Visual */}
        <section className="text-center space-y-6 animate-slide-up">
          <div className={`w-32 h-32 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 ${
            isPassed ? 'bg-primary text-white' : 'bg-red-500 text-white'
          }`}>
            <span className="material-symbols-outlined text-6xl font-black">
              {isPassed ? 'workspace_premium' : 'error'}
            </span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-headline font-black text-slate-900 tracking-tighter italic">Kuis Selesai!</h2>
            <p className="text-slate-500 font-medium">{quiz.title} • {quiz.courses.title}</p>
          </div>
        </section>

        {/* Score Card */}
        <section className="bg-white rounded-[3rem] p-12 whisper-shadow border border-slate-50 text-center space-y-8 animate-slide-up [animation-delay:200ms]">
          <div className="space-y-1">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Skor Performa Anda</span>
             <h1 className={`text-9xl font-headline font-black tracking-tighter ${isPassed ? 'text-primary' : 'text-red-500'}`}>
                {submission.score}
             </h1>
          </div>

          <div className="flex flex-col items-center gap-3">
             <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border ${
                isPassed ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
             }`}>
                {isPassed ? 'Lulus' : 'Tidak Lulus'}
             </div>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Nilai Minimum Kelulusan: <span className="text-slate-900">{quiz.passing_grade}%</span>
             </p>
          </div>

          <div className="pt-8 border-t border-slate-50 grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Tanggal Submit</p>
              <p className="text-sm font-bold text-slate-800">{new Date(submission.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Verifikasi</p>
              <p className={`text-sm font-bold italic ${submission.is_manually_graded ? 'text-primary' : 'text-slate-400'}`}>
                {submission.is_manually_graded ? 'Dinilai oleh Dosen' : 'Dinilai Otomatis'}
              </p>
            </div>
          </div>

          {/* Instructor Feedback Section */}
          {submission.feedback && (
            <div className="pt-8 border-t border-slate-50 text-left animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">comment</span>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 underline underline-offset-4 decoration-primary decoration-2">Catatan Dosen</h4>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed font-medium">
                "{submission.feedback}"
              </div>
            </div>
          )}
        </section>


        {/* Action Buttons */}
        <section className="flex flex-col gap-4 animate-slide-up [animation-delay:400ms]">
          <a href="/student/dashboard">
            <Button className="w-full h-16 rounded-2xl shadow-xl hover:scale-105 transition-all font-black text-base italic tracking-tight">
              Kembali ke Dashboard
              <span className="material-symbols-outlined ml-2">dashboard</span>
            </Button>
          </a>
          
          <a href={`/student/courses/${quiz.courses.id}`}>
            <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-sm tracking-tight">
              Kembali ke Detail Kursus
              <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
            </Button>
          </a>

          <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            ID Rekaman Akademik: {submission.id.substring(0,8).toUpperCase()}
          </p>
        </section>

      </div>
    </div>
  );
}
