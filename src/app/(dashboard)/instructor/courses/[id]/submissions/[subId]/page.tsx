import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/quiz/audio-player';
import { GradingForm } from '../grading-form';


export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string; subId: string }>;
}) {
  const { id: courseId, subId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch Submission with details
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, student:users!submissions_student_id_fkey(*), quizzes(*)')
    .eq('id', subId)
    .single();

  if (!submission) redirect(`/instructor/courses/${courseId}/submissions`);

  // Fetch Answers
  const { data: answers } = await supabase
    .from('submission_answers')
    .select('*, question:questions(*, answers(*))')
    .eq('submission_id', subId)
    .order('question_id');

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-5xl mx-auto font-body">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-1">
          <a href={`/instructor/courses/${courseId}/submissions?quizId=${submission.quiz_id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Kembali ke Buku Nilai
          </a>
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Tinjau Jawaban</h2>
          <p className="text-on-surface-variant font-medium lowercase tracking-tight">
            Meninjau jawaban <span className="text-primary font-bold">{submission.student?.name}</span>'s attempt for <span className="font-bold">{submission.quizzes?.title}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
           <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai Akhir</p>
                <p className="text-3xl font-headline font-black text-primary tracking-tighter">{submission.score}%</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">grade</span>
           </div>
        </div>
      </section>

      {/* Proctoring Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-3xl border flex items-center gap-4 ${submission.tab_switch_count > 0 ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
            <span className="material-symbols-outlined text-4xl">{submission.tab_switch_count > 0 ? 'warning' : 'verified_user'}</span>
            <div>
                <h4 className="font-black text-sm uppercase tracking-widest">Pemeriksaan Integritas</h4>
                <p className="text-xs font-medium opacity-80">{submission.tab_switch_count} perpindahan tab terdeteksi selama sesi.</p>
            </div>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-blue-300">schedule</span>
            <div>
                <h4 className="font-black text-sm uppercase tracking-widest">Dikirim Pada</h4>
                <p className="text-xs font-medium text-slate-400">{new Date(submission.submitted_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>
        </div>
      </section>

      {/* Response Breakdown */}
      <section className="space-y-8">
        <h3 className="text-xl font-headline font-black italic tracking-tight text-slate-800">Detail Jawaban</h3>
        
        <div className="space-y-6">
            {answers?.map((ans: any, idx: number) => {
                const isSpeaking = ans.question?.type === 'speaking';
                const isEssay = ans.question?.type === 'essay';
                const isCorrect = ans.answer_id && ans.question?.answers?.find((a: any) => a.id === ans.answer_id)?.is_correct;

                return (
                    <div key={ans.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 transition-all hover:shadow-md group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {idx + 1} ({ans.question?.type})</span>
                                <p className="text-lg font-bold text-slate-800 leading-snug">{ans.question?.question_text}</p>
                            </div>
                            {ans.question?.type === 'mcq' && (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    <span className="material-symbols-outlined">{isCorrect ? 'check' : 'close'}</span>
                                </div>
                            )}
                        </div>

                        {/* Speaking Player */}
                        {isSpeaking && ans.answer_text && (
                            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rekaman Suara</p>
                                <AudioPlayer src={ans.answer_text} />
                            </div>
                        )}

                        {/* Essay Text */}
                        {isEssay && (
                             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Jawaban Mahasiswa</p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                                    "{ans.answer_text || '(Tidak ada jawaban)'}"
                                </p>
                             </div>
                        )}

                        {/* MCQ Choice */}
                        {!isSpeaking && !isEssay && (
                             <div className="flex flex-wrap gap-2">
                                {ans.question?.answers?.map((opt: any) => {
                                    const isSelected = opt.id === ans.answer_id;
                                    return (
                                        <div 
                                            key={opt.id}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                                                isSelected 
                                                    ? (opt.is_correct ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')
                                                    : (opt.is_correct ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-100 text-slate-400 opacity-60')
                                            }`}
                                        >
                                            {opt.answer_text}
                                            {isSelected && <span className="ml-2 text-[10px] font-black uppercase">(Dipilih)</span>}
                                            {opt.is_correct && !isSelected && <span className="ml-2 text-[10px] font-black uppercase">(Kunci)</span>}
                                        </div>
                                    )
                                })}
                             </div>
                        )}
                    </div>
                )
            })}
        </div>
      </section>

      {/* Manual Grading Console */}
      <section id="grading-console">
          <GradingForm 
            courseId={courseId}
            submissionId={subId}
            initialScore={submission.score || 0}
            initialFeedback={submission.feedback || ''}
          />
      </section>

    </div>
  );
}
