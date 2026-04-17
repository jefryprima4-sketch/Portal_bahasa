import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function InstructorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch Data
  const { data: courses } = await supabase.from('courses').select('*').eq('instructor_id', user.id);
  const courseIds = courses?.map(c => c.id) || [];
  
  const { data: enrollments } = courseIds.length
    ? await supabase.from('course_enroll').select('*, users(name, email, id)').in('course_id', courseIds).order('enrolled_at', { ascending: false })
    : { data: [] };
    
  const { data: pendingSubmissions } = courseIds.length
    ? await supabase.from('submissions')
        .select('*, users(name), quizzes(title, course_id)')
        .in('quizzes.course_id', courseIds)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5)
    : { data: [] };

  const { data: allScores } = courseIds.length
    ? await supabase.from('submissions')
        .select('score')
        .in('quiz_id', (await supabase.from('quizzes').select('id').in('course_id', courseIds)).data?.map(q => q.id) || [])
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
          <a href="/instructor/courses" className="sm:inline-block hidden">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 font-bold">Kelola Kursus</Button>
          </a>
          <a href="/instructor/courses/create">
            <Button className="h-12 px-6 rounded-2xl shadow-xl hover:scale-105 transition-all font-bold">
              <span className="material-symbols-outlined mr-2">add</span>
              Buat Kursus Baru
            </Button>
          </a>
        </div>
      </section>

      {/* Quick Stats Bento Grid (Inspired by Stitch) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col justify-between h-36">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Mahasiswa</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black text-primary tracking-tighter">{enrollments?.length || 0}</span>
            <span className="material-symbols-outlined text-blue-100 text-4xl">group</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col justify-between h-36">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Kursus Aktif</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black text-primary tracking-tighter">{courses?.length || 0}</span>
            <span className="material-symbols-outlined text-blue-100 text-4xl">menu_book</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col justify-between h-36">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Rata-rata Performa</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black text-primary tracking-tighter">{avgScore}%</span>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary" style={{ width: `${avgScore}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-[2rem] shadow-2xl flex flex-col justify-between h-36">
          <span className="text-xs font-black uppercase tracking-widest text-blue-200">Pending Grading</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-headline font-black tracking-tighter">{pendingSubmissions?.length || 0}</span>
            <span className="material-symbols-outlined text-blue-300 text-4xl">history_edu</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Progres Kelas Table (Left 2/3) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-headline font-black tracking-tight italic text-slate-800">Progres Kelas</h3>
            <a href="/instructor/attendance" className="text-primary text-sm font-bold hover:underline">Pantau Kehadiran</a>
          </div>
          
          <div className="bg-white rounded-[2.5rem] overflow-hidden whisper-shadow border border-slate-50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-500">
                  <th className="px-8 py-5">Student</th>
                  <th className="px-8 py-5">Course</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enrollments && enrollments.slice(0, 5).map((en: any) => (
                  <tr key={en.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-black text-xs">
                        {en.users?.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{en.users?.name}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-500">
                      {courses?.find(c => c.id === en.course_id)?.title}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Aktif</span>
                    </td>
                  </tr>
                ))}
                {!enrollments?.length && (
                   <tr>
                     <td colSpan={3} className="px-8 py-12 text-center text-slate-400 text-sm">Belum ada mahasiswa terdaftar</td>
                   </tr>
                )}
              </tbody>
            </table>
            <div className="px-8 py-5 bg-slate-50/20 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menampilkan aktivitas mahasiswa aktif</span>
              <a href="/instructor/courses" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Lihat Semua Kursus</a>
            </div>
          </div>
        </section>

        {/* Kuis Perlu Dinilai (Right 1/3) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-headline font-black tracking-tight italic text-slate-800">Kuis Perlu Dinilai</h3>
            <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">Perlu Aksi</span>
          </div>
          
          <div className="space-y-4">
            {pendingSubmissions && pendingSubmissions.length > 0 ? (
                pendingSubmissions.map((sub: any) => (
                    <div key={sub.id} className="bg-white p-6 rounded-[1.5rem] whisper-shadow border-l-8 border-primary group hover:translate-x-2 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">{sub.quizzes?.title}</h4>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">New</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mb-4">Mahasiswa: <span className="font-bold text-slate-700">{sub.users?.name}</span></p>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-slate-100 text-[9px] rounded-full text-slate-600 font-black uppercase tracking-widest">CBT Response</span>
                          <a href={`/instructor/courses/${sub.quizzes?.course_id}/submissions`} className="text-[10px] font-black text-primary flex items-center gap-1 hover:underline">
                            Nilai Sekarang <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </a>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-10 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tidak Ada Tugas</p>
                </div>
            )}

            {/* Teaching Resource Card */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <h5 className="text-lg font-headline font-black italic tracking-tight">Kualitas Pengajaran</h5>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Feedback yang tepat waktu meningkatkan performa dan semangat mahasiswa. Nilai submisi yang tertunda agar mahasiswa tetap on track.
                    </p>
                    <a href="/instructor/courses"><Button variant="secondary" className="w-full h-12 rounded-xl text-primary font-black text-xs uppercase tracking-widest">Kelola Kursus</Button></a>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
