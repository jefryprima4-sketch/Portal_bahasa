import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function StudentDetailActivityPage({ 
  params 
}: { 
  params: Promise<{ id: string; studentId: string }> 
}) {
  const { id: courseId, studentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Ambil Profil Mahasiswa
  const { data: student } = await supabase.from('users').select('*').eq('id', studentId).single();
  const { data: course } = await supabase.from('courses').select('title').eq('id', courseId).single();
  if (!student) redirect(`/instructor/courses/${courseId}/submissions`);

  // 2. Ambil Progres Materi
  const { data: materials } = await supabase.from('materials').select('*').eq('course_id', courseId).order('created_at', { ascending: true });
  const { data: views } = await supabase.from('material_views').select('material_id').eq('student_id', studentId);
  const viewedIds = new Set(views?.map(v => v.material_id) || []);

  // 3. Ambil Riwayat Kuis
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, quizzes (title, passing_grade)')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  return (
    <div className="space-y-8 font-body max-w-5xl mx-auto">
      <div className="space-y-2">
        <a href={`/instructor/courses/${courseId}/submissions`} className="text-sm hover:underline flex items-center gap-1" style={{ color: 'var(--primary)' }}>
          <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Buku Nilai
        </a>
        <div className="flex items-center gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
            </div>
            <div>
                <h2 className="text-3xl font-headline font-extrabold tracking-tight">{student.name}</h2>
                <div className="flex items-center gap-3 text-sm text-[var(--on-surface-variant)]">
                    <span className="font-bold">NIM: {student.nim_nip}</span>
                    <span className="text-slate-300">•</span>
                    <span>{student.email}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Progress Tracking */}
        <div className="space-y-6">
            <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">checklist</span>
                Pelacakan Materi
            </h3>
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                        {materials?.map((mat: any) => {
                            const isViewed = viewedIds.has(mat.id);
                            return (
                                <div key={mat.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-sm ${isViewed ? 'text-green-500' : 'text-slate-300'}`}>
                                            {isViewed ? 'check_circle' : 'circle'}
                                        </span>
                                        <span className={`text-sm ${isViewed ? 'font-medium' : 'text-slate-500'}`}>{mat.title}</span>
                                    </div>
                                    <Badge variant={isViewed ? 'success' : 'secondary'} className="text-[9px]">
                                        {isViewed ? 'DILIHAT' : 'BELUM'}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right: Quiz Performance */}
        <div className="space-y-6">
            <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)]">analytics</span>
                Hasil Evaluasi Kuis
            </h3>
            {submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                    {submissions.map((sub: any) => {
                        const passed = sub.score >= sub.quizzes?.passing_grade;
                        return (
                            <Card key={sub.id} className="border-none shadow-sm overflow-hidden">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold">{sub.quizzes?.title}</p>
                                        <p className="text-[10px] text-[var(--outline)]">DIKERJAKAN: {new Date(sub.submitted_at).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                            {sub.score}
                                        </div>
                                        <Badge variant={passed ? 'success' : 'destructive'} className="text-[9px]">
                                            {passed ? 'Lulus' : 'Gagal'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center text-sm text-[var(--on-surface-variant)] italic">
                    Mahasiswa ini belum mengerjakan kuis apa pun.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
