import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addQuestion, deleteQuestion } from '../../actions';

export default async function EditQuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id: courseId, quizId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
  const { data: questions } = await supabase.from('questions')
    .select('*, answers (*)')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true });

  if (!quiz) redirect(`/instructor/courses/${courseId}/quizzes`);

  return (
    <div className="space-y-8 font-body max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <a href={`/instructor/courses/${courseId}/quizzes`} className="text-sm hover:underline flex items-center gap-1" style={{ color: 'var(--primary)' }}>
            <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Daftar Kuis
          </a>
          <h2 className="text-3xl font-headline font-extrabold mt-2 tracking-tight">{quiz.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-[var(--on-surface-variant)]">{questions?.length || 0} Pertanyaan Terdaftar</p>
            <span className="text-[var(--outline)] text-xs">•</span>
            <Badge variant={quiz.is_listening ? 'warning' : 'info'}>{quiz.is_listening ? 'LISTENING' : 'READING/GENERAL'}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Questions List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-headline font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary)]">list_alt</span>
            Daftar Soal
          </h3>
          
          {questions && questions.length > 0 ? (
            questions.map((q: any, i: number) => (
              <Card key={q.id} className="border-none shadow-sm overflow-hidden group">
                <div className="bg-[var(--surface-container-low)] px-4 py-2 flex items-center justify-between border-b border-[var(--outline-variant)]/30">
                  <span className="text-xs font-bold text-[var(--outline)] uppercase tracking-wider">Soal #{i + 1} — {q.type.toUpperCase()}</span>
                  <form action={async () => {
                    'use server';
                    await deleteQuestion(q.id, quizId, courseId);
                  }}>
                    <Button variant="ghost" size="sm" type="submit" className="text-[var(--error)] h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </Button>
                  </form>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-4">
                    {q.audio_url && (
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-orange-600">headphones</span>
                      </div>
                    )}
                    <p className="text-sm font-medium leading-relaxed">{q.question_text}</p>
                  </div>
                  
                  {q.answers?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                      {q.answers.map((a: any, idx: number) => (
                        <div key={a.id} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${a.is_correct ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-100'}`}>
                          <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                          <span className="flex-1">{a.answer_text}</span>
                          {a.is_correct && <span className="material-symbols-outlined text-xs">check_circle</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-[var(--outline-variant)] rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-[var(--outline)] mb-2">quiz</span>
              <p className="text-sm text-[var(--on-surface-variant)]">Belum ada soal. Gunakan form di samping untuk menambah.</p>
            </div>
          )}
        </div>

        {/* Right: Add Form */}
        <div className="space-y-6">
          <Card className="border-none shadow-md sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">add_circle</span>
                Tambah Soal Baru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addQuestion} className="space-y-4">
                <input type="hidden" name="quiz_id" value={quizId} />
                <input type="hidden" name="course_id" value={courseId} />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Pertanyaan</label>
                  <textarea 
                    name="question_text" 
                    required 
                    rows={3}
                    className="w-full rounded-xl border border-[var(--outline-variant)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                    placeholder="Tulis soal di sini..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Tipe Soal</label>
                  <select name="type" required className="rounded-xl border border-[var(--outline-variant)] px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30">
                    <option value="mcq">Pilihan Ganda (MCQ)</option>
                    <option value="essay">Essay / Fill-in</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">URL Audio (Untuk Listening)</label>
                  <Input name="audio_url" type="text" placeholder="https://..." className="bg-white" />
                  <p className="text-[10px] text-[var(--outline)]">Upload file audio di tab "Materi" lalu salin URL-nya ke sini.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-sm font-bold border-b border-[var(--outline-variant)] pb-1">Kunci Jawaban</p>
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex items-center gap-3 bg-[var(--surface-container-low)] p-2 rounded-lg border border-[var(--outline-variant)]/50">
                      <div className="flex-1">
                        <input 
                          name={`answer_${n}`} 
                          placeholder={`Opsi ${n}`}
                          className="w-full bg-transparent border-none text-xs focus:ring-0 p-0"
                        />
                      </div>
                      <label className="flex items-center gap-1 text-[10px] font-bold uppercase cursor-pointer select-none">
                        <input type="checkbox" name={`answer_${n}_correct`} className="rounded text-[var(--primary)]" /> 
                        <span className="text-green-700">Benar</span>
                      </label>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full mt-2 py-6">
                  <span className="material-symbols-outlined text-sm mr-2">save</span>
                  Simpan Pertanyaan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
