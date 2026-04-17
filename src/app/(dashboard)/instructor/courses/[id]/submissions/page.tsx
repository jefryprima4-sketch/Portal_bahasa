import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { GradebookExport } from '@/components/gradebook/export-button';

export default async function InstructorGradebookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quizId?: string }>;
}) {
  const { id: courseId } = await params;
  const { quizId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: course } = await supabase.from('courses').select('title').eq('id', courseId).single();
  const { data: quizzes } = await supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
  const selectedQuizId = quizId || quizzes?.[0]?.id;

  // 1. Ambil seluruh mahasiswa yang terdaftar (Enrolled Students)
  const { data: enrollments } = await supabase
    .from('course_enroll')
    .select('*, student:users!course_enroll_student_id_fkey (id, name, nim_nip, email)')
    .eq('course_id', courseId);

  // 2. Data Pelacakan Progres
  const { data: allMaterials } = await supabase.from('materials').select('id').eq('course_id', courseId);
  const totalMatsCount = allMaterials?.length || 0;
  
  const studentIds = enrollments?.map(e => e.student_id) || [];
  const { data: allViews } = await supabase
    .from('material_views')
    .select('student_id, material_id')
    .in('student_id', studentIds);

  // 3. Data Nilai Kuis (Submissions) & Proctoring
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('quiz_id', selectedQuizId)
    .in('student_id', studentIds)
    .eq('status', 'submitted');

  // 4. Data Kehadiran (Attendance)
  const { data: allAttendance } = await supabase
    .from('attendance')
    .select('student_id, timestamp')
    .eq('course_id', courseId)
    .in('student_id', studentIds);

  // Helper untuk hitung progres per mahasiswa
  const studentsWithStats = enrollments?.map((enroll: any) => {
    const student = enroll.student;
    
    // Progres Materi
    const views = allViews?.filter(v => v.student_id === student.id) || [];
    const validViews = views.filter(v => allMaterials?.some(m => m.id === v.material_id));
    const progress = totalMatsCount > 0 ? Math.round((validViews.length / totalMatsCount) * 100) : 0;
    
    // Nilai Kuis & Proctoring
    const submission = allSubmissions?.find(s => s.student_id === student.id);
    
    // Kehadiran (Unique sessions based on date)
    const attendeeRecords = allAttendance?.filter(a => a.student_id === student.id) || [];
    const uniqueSessions = new Set(attendeeRecords.map(a => new Date(a.timestamp).toISOString().split('T')[0]));
    
    return {
      ...student,
      progress,
      score: submission?.score,
      submittedAt: submission?.submitted_at,
      subId: submission?.id,
      isManuallyGraded: submission?.is_manually_graded || false,
      tabSwitches: submission?.tab_switch_count || 0,
      attendanceCount: uniqueSessions.size
    };


  }) || [];


  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto font-body">
      {/* Gradebook Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <a href={`/instructor/courses/${courseId}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Hub Kursus
          </a>
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Buku Nilai</h2>
          <p className="text-on-surface-variant font-medium lowercase tracking-tight">Analisis performa untuk <span className="text-primary font-bold italic">{course?.title}</span></p>
        </div>
        <GradebookExport data={studentsWithStats} filename={`Gradebook_${course?.title}`} />
      </section>

      {/* Quiz Selector Pills */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Evaluasi Aktif</h3>
        <div className="flex gap-3 flex-wrap">
            {quizzes && quizzes.length > 0 ? (
                quizzes.map((q: any) => (
                    <a key={q.id} href={`/instructor/courses/${courseId}/submissions?quizId=${q.id}`} className="block">
                        <div className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                            q.id === selectedQuizId 
                                ? 'bg-primary text-white shadow-xl scale-105 border-primary border' 
                                : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'
                        }`}>
                            {q.title}
                        </div>
                    </a>
                ))
            ) : (
                <div className="text-xs text-slate-400 italic">Tidak ada kuis untuk kursus ini.</div>
            )}
        </div>
      </section>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden whisper-shadow border border-slate-50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-500 border-b border-slate-100">
              <th className="px-8 py-5">Mahasiswa</th>
              <th className="px-8 py-5 text-center">Nilai</th>
              <th className="px-8 py-5 text-center">Sesi Terakhir</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {studentsWithStats.length > 0 ? (
                studentsWithStats.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-5">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{student.name}</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID: {student.nim_nip}</span>
                            </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                            {student.score !== undefined ? (
                                <span className={`text-2xl font-headline font-black tracking-tighter ${student.score >= 75 ? 'text-primary' : 'text-orange-600'}`}>
                                    {student.score}
                                </span>
                            ) : (
                                <span className="text-[10px] text-slate-300">-</span>
                            )}
                        </td>
                        <td className="px-8 py-5 text-center">
                            <span className="text-sm font-bold text-slate-600">{student.attendanceCount}</span>
                        </td>
                        <td className="px-8 py-5">
                            {student.score !== undefined ? (
                                student.isManuallyGraded ? (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl border border-green-100">
                                        <span className="material-symbols-outlined text-sm font-black">verified_user</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Dinilai</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 animate-pulse">
                                        <span className="material-symbols-outlined text-sm font-black">rate_review</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Menunggu Review</span>
                                    </div>
                                )
                            ) : (
                                <span className="text-[10px] bg-slate-50 text-slate-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">BELUM</span>
                            )}
                        </td>

                        <td className="px-8 py-5 text-right flex flex-col items-end gap-2">
                            <a href={`/instructor/courses/${courseId}/students/${student.id}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                                Profil <span className="material-symbols-outlined text-sm">person</span>
                            </a>
                            {student.subId && (
                                <a href={`/instructor/courses/${courseId}/submissions/${student.subId}`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                                    Review <span className="material-symbols-outlined text-sm">rate_review</span>
                                </a>
                            )}
                        </td>

                    </tr>
                ))

            ) : (
                <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-slate-200 text-3xl">group_off</span>
                        </div>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Tidak ada mahasiswa terdaftar</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
        
        <div className="px-8 py-5 bg-slate-50/20 text-center border-t border-slate-50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Basis Data Buku Nilai Akademik</p>
        </div>
      </div>
    </div>
  );
}
