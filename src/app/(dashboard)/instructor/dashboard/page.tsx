import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function InstructorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch Data: Level 1
  const { data: courses } = await supabase.from('courses').select('*').eq('instructor_id', user.id);
  const courseIds = courses?.map(c => c.id) || [];
  
  // Fetch Data: Level 2 Concurrent
  const [
    { data: enrollments },
    { data: pendingSubmissions },
    { data: quizzesResult }
  ] = await Promise.all([
    courseIds.length
      ? supabase.from('course_enroll').select('*, users(name, email, id)').in('course_id', courseIds).order('enrolled_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? supabase.from('submissions')
          .select('*, users(name), quizzes(title, course_id)')
          .in('quizzes.course_id', courseIds)
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    courseIds.length
      ? supabase.from('quizzes').select('id').in('course_id', courseIds)
      : Promise.resolve({ data: [] })
  ]);

  // Fetch Data: Level 3
  const quizIds = quizzesResult?.map(q => q.id) || [];
  const { data: allScores } = quizIds.length
    ? await supabase.from('submissions').select('score').in('quiz_id', quizIds)
    : { data: [] };

  const graded = (allScores || []).filter((s: any) => s.score !== null);
  const avgScore = graded.length
    ? (graded.reduce((s: number, x: any) => s + Number(x.score), 0) / graded.length).toFixed(1)
    : '0';

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tight italic">Dashboard Pengajar</h2>
          <p className="text-on-surface-variant font-medium">Memantau performa akademik dan aktivitas mahasiswa secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/instructor/courses" className="sm:inline-block hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 font-bold">Kelola Kursus</Button>
          </Link>
          <Link href="/instructor/courses/create" className="focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
            <Button className="h-12 px-6 rounded-2xl shadow-xl hover:scale-[1.02] transition-all font-bold">
              <span className="material-symbols-outlined mr-2">add</span>
              Buat Kursus Baru
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Stats Bento Grid (Inspired by Stitch) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] whisper-shadow border border-surface-container flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-lg transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Total Mahasiswa</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black text-primary tracking-tight">{enrollments?.length || 0}</span>
            <span className="material-symbols-outlined text-primary-fixed text-4xl">group</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] whisper-shadow border border-surface-container flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-lg transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Kursus Aktif</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black text-secondary tracking-tight">{courses?.length || 0}</span>
            <span className="material-symbols-outlined text-secondary-fixed text-4xl">menu_book</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[2rem] whisper-shadow border border-surface-container flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-lg transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Rata-rata Performa</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black text-tertiary tracking-tight">{avgScore}%</span>
            <div className="w-16 h-2 bg-surface-container rounded-full overflow-hidden mb-2">
              <div className="h-full bg-tertiary" style={{ width: `${avgScore}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-[2rem] shadow-lg flex flex-col justify-between h-36 relative overflow-hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-fixed">Pending Grading</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black tracking-tight">{pendingSubmissions?.length || 0}</span>
            <span className="material-symbols-outlined text-primary-fixed-dim text-4xl">history_edu</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Progres Kelas Table (Left 2/3) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-headline font-black tracking-tight italic text-on-surface">Progres Kelas</h3>
            <Link href="/instructor/attendance" className="text-primary text-sm font-bold hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">Pantau Kehadiran</Link>
          </div>
          
          <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden whisper-shadow border border-surface-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
                  <th className="px-8 py-5">Student</th>
                  <th className="px-8 py-5">Course</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {enrollments && enrollments.slice(0, 5).map((en: any) => (
                  <tr key={en.id} className="hover:bg-surface/50 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-black text-xs shadow-sm">
                        {en.users?.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{en.users?.name}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-on-surface-variant">
                      {courses?.find(c => c.id === en.course_id)?.title}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-3 py-1 bg-secondary-fixed/50 text-secondary border border-secondary/20 rounded-full text-xs font-semibold uppercase tracking-wider">Aktif</span>
                    </td>
                  </tr>
                ))}
                {!enrollments?.length && (
                   <tr>
                     <td colSpan={3} className="px-8 py-12 text-center text-on-surface-variant text-sm">Belum ada mahasiswa terdaftar</td>
                   </tr>
                )}
              </tbody>
            </table>
            <div className="px-8 py-5 bg-surface border-t border-surface-container flex justify-between items-center mt-auto">
              <span className="text-xs font-semibold text-on-surface-variant tracking-wider">Menampilkan aktivitas terbaru</span>
              <Link href="/instructor/courses" className="text-xs font-bold text-primary tracking-wider hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">Lihat Semua Kursus</Link>
            </div>
          </div>
        </section>

        {/* Kuis Perlu Dinilai (Right 1/3) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-headline font-black tracking-tight italic text-on-surface">Perlu Dinilai</h3>
            {pendingSubmissions && pendingSubmissions.length > 0 && (
              <span className="px-3 py-1 bg-error-container text-error text-xs font-semibold rounded-full uppercase tracking-wider animate-pulse border border-error/20">Perlu Aksi</span>
            )}
          </div>
          
          <div className="space-y-4">
            {pendingSubmissions && pendingSubmissions.length > 0 ? (
                pendingSubmissions.map((sub: any) => (
                    <Link href={`/instructor/courses/${sub.quizzes?.course_id}/submissions`} key={sub.id} className="block bg-surface-container-lowest p-6 rounded-[1.5rem] whisper-shadow border-l-8 border-primary group hover:translate-x-2 transition-all focus-visible:ring-2 focus-visible:ring-primary">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{sub.quizzes?.title}</h4>
                           <span className="text-xs font-semibold text-primary-fixed-dim bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">New</span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium mb-4">
                          Mahasiswa: <span className="font-bold text-on-surface">{sub.users?.name}</span>
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-surface-container text-xs rounded-full text-on-surface-variant font-semibold uppercase tracking-wider">CBT Response</span>
                          <span className="text-xs font-black text-primary flex items-center gap-1">
                            Dinilai <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </span>
                        </div>
                    </Link>
                ))
            ) : (
                <div className="p-10 text-center bg-surface rounded-[2rem] border-2 border-dashed border-outline-variant">
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Tidak Ada Tugas Pending</p>
                </div>
            )}

            {/* Teaching Resource Card */}
            <div className="bg-on-surface text-surface-container-lowest p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <h5 className="text-lg font-headline font-black italic tracking-tight">Kualitas Pengajaran</h5>
                    <p className="text-xs text-surface-container leading-relaxed font-medium">
                        Feedback yang tepat waktu sangat penting. Tetap jaga semangat mahasiswa dengan memberi nilai tugas secara rutin.
                    </p>
                    <Link href="/instructor/courses" className="block focus-visible:ring-2 focus-visible:ring-primary-fixed rounded-xl w-full">
                      <Button variant="secondary" className="w-full h-12 rounded-xl text-primary font-bold text-sm">Kelola Kursus</Button>
                    </Link>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl group-hover:bg-primary/50 transition-all duration-700" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
