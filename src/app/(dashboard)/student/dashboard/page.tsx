import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student } = await supabase.from('users').select('*').eq('id', user.id).single();
  
  const { data: enrollments } = await supabase.from('course_enroll')
    .select('*, courses (id, title, description, image_url)')
    .eq('student_id', user.id);

  const enrolledCourseIds = enrollments?.map((e: any) => e.course_id) || [];

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, quizzes (id, title, course_id, courses (title))')
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(3);

  // Only fetch materials for enrolled courses (not all materials in the database)
  const { data: totalMaterials } = enrolledCourseIds.length
    ? await supabase.from('materials').select('id, course_id').in('course_id', enrolledCourseIds)
    : { data: [] };
  const { data: viewedMaterials } = await supabase.from('material_views').select('material_id').eq('student_id', user.id);
  const viewedIds = new Set(viewedMaterials?.map(v => v.material_id) || []);

  const coursesWithProgress = enrollments?.map((enroll: any) => {
    const courseMats = totalMaterials?.filter(m => m.course_id === enroll.course_id) || [];
    const viewedCourseMats = courseMats.filter(m => viewedIds.has(m.id));
    const progress = courseMats.length > 0 ? Math.round((viewedCourseMats.length / courseMats.length) * 100) : 0;
    return { ...enroll, real_progress: progress };
  }) || [];

  const gradedSubmissions = submissions?.filter((s: any) => s.score !== null) || [];
  const avgScore = gradedSubmissions.length
    ? (gradedSubmissions.reduce((sum: number, s: any) => sum + Number(s.score), 0) / gradedSubmissions.length).toFixed(1)
    : '0';

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto">
      {/* Welcome Header - Stitch style */}
      <section className="space-y-1">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Selamat datang, {student?.name?.split(' ')[0]}!</h2>
        <p className="text-on-surface-variant font-medium">Anda telah menyelesaikan {viewedIds.size} materi. Terus semangat belajar!</p>
      </section>

      {/* Overview Cards: Bento Style */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] whisper-shadow group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary-fixed rounded-2xl text-primary">
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
            <span className="text-xs font-bold font-headline text-primary bg-primary-fixed/30 px-3 py-1 rounded-full uppercase tracking-wider">Aktif</span>
          </div>
          <p className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Kursus Terdaftar</p>
          <h3 className="text-4xl font-headline font-black tracking-tighter">{enrollments?.length || 0}</h3>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-[2rem] whisper-shadow group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl text-secondary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <p className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Rata-rata Progres Kursus</p>
          <h3 className="text-4xl font-headline font-black tracking-tighter">
            {coursesWithProgress.length ? Math.round(coursesWithProgress.reduce((a, b) => a + b.real_progress, 0) / coursesWithProgress.length) : 0}%
          </h3>
          <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${coursesWithProgress.length ? Math.round(coursesWithProgress.reduce((a, b) => a + b.real_progress, 0) / coursesWithProgress.length) : 0}%` }} 
            />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-[2rem] whisper-shadow group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-tertiary-fixed rounded-2xl text-tertiary">
              <span className="material-symbols-outlined">workspace_premium</span>
            </div>
          </div>
          <p className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Rata-rata Nilai Kuis</p>
          <h3 className="text-4xl font-headline font-black tracking-tighter">{avgScore}</h3>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Courses (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h4 className="text-2xl font-headline font-black tracking-tight italic text-slate-800">Kursus Berjalan</h4>
                <a href="/student/courses" className="text-primary text-sm font-bold hover:underline">Lihat Semua</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coursesWithProgress.map((enroll: any) => (
                    <div key={enroll.course_id} className="bg-white rounded-[2.5rem] overflow-hidden soft-shadow border border-slate-50 group transition-all hover:translate-y-[-4px]">
                        <div className="h-40 bg-slate-200 relative overflow-hidden">
                            {enroll.courses?.image_url ? (
                                <img
                                    src={enroll.courses.image_url}
                                    alt={enroll.courses.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-blue-200">menu_book</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-4 left-6">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] text-white font-bold tracking-widest uppercase">
                                    Fase Belajar
                                </span>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <h5 className="font-headline font-black text-xl text-slate-900 leading-tight mb-2">{enroll.courses?.title}</h5>
                                <p className="text-sm text-slate-500 line-clamp-2 font-medium">{enroll.courses?.description}</p>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span>Progress</span>
                                    <span className="text-primary">{enroll.real_progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000" 
                                        style={{ width: `${enroll.real_progress}%` }} 
                                    />
                                </div>
                            </div>
                            
                            <a href={`/student/courses/${enroll.course_id}`} className="block w-full py-4 bg-slate-50 text-blue-800 font-black text-sm rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-xl text-center">
                                Lanjutkan Belajar
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Column: Langkah Selanjutnya & Scores */}
        <div className="space-y-10">
            {/* Langkah Selanjutnya */}
            <section className="space-y-6 px-2">
                <h4 className="text-2xl font-headline font-black tracking-tight italic text-slate-800">Langkah Selanjutnya</h4>
                <div className="space-y-4">
                    <a href="/student/courses" className="block p-5 bg-white rounded-[1.5rem] flex items-start gap-4 whisper-shadow hover:translate-x-2 transition-transform cursor-pointer border border-slate-50">
                        <div className="w-12 h-12 shrink-0 bg-tertiary-fixed rounded-2xl flex items-center justify-center text-tertiary">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">Lanjutkan Belajar</p>
                            <p className="text-xs text-slate-500 font-medium">{viewedIds.size} materi telah dilihat dari {totalMaterials?.length || 0} total.</p>
                        </div>
                    </a>

                    <a href="/student/explore" className="block p-5 bg-white rounded-[1.5rem] flex items-start gap-4 whisper-shadow hover:translate-x-2 transition-transform cursor-pointer border border-slate-50">
                        <div className="w-12 h-12 shrink-0 bg-primary-fixed rounded-2xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">Cari Course Baru</p>
                            <p className="text-xs text-slate-500 font-medium">Temukan kelas bahasa yang tersedia.</p>
                        </div>
                    </a>
                </div>
            </section>

            {/* Nilai Terbaru Table */}
            <section className="space-y-6 px-2">
                <h4 className="text-2xl font-headline font-black tracking-tight italic text-slate-800">Nilai Terbaru</h4>
                <div className="bg-white rounded-[2rem] overflow-hidden whisper-shadow border border-slate-50">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Kuis</th>
                                <th className="px-6 py-4 text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                            {submissions?.map((sub: any) => (
                                <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800 truncate max-w-[120px]">{sub.quizzes?.title}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-3 py-1 rounded-full font-black text-xs ${Number(sub.score) >= 75 ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {sub.score || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!submissions?.length && (
                                <tr>
                                    <td colSpan={2} className="px-6 py-8 text-center text-slate-400 text-xs">Belum ada aktivitas kuis</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {(submissions?.length ?? 0) > 0 && (
                        <div className="p-4 bg-slate-50/20 text-center">
                            <a href="/student/courses" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Lihat Semua Kursus</a>
                        </div>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
