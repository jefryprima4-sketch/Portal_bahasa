import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Fetch first layer data concurrently
  const [
    { data: student },
    { data: enrollments },
    { data: submissions }
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('course_enroll')
      .select('*, courses (id, title, description, image_url)')
      .eq('student_id', user.id),
    supabase.from('submissions')
      .select('*, quizzes (id, title, course_id, courses (title))')
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(3)
  ]);

  const enrolledCourseIds = enrollments?.map((e: any) => e.course_id) || [];

  // 2. Fetch second layer data concurrently based on enrolled courses
  const [
    { data: totalMaterials },
    { data: viewedMaterials }
  ] = await Promise.all([
    enrolledCourseIds.length
      ? supabase.from('materials').select('id, course_id').in('course_id', enrolledCourseIds)
      : Promise.resolve({ data: [] }),
    supabase.from('material_views').select('material_id').eq('student_id', user.id)
  ]);

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
      {/* Welcome Header */}
      <section className="space-y-1">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">
          Selamat datang, {student?.name?.split(' ')[0]}!
        </h2>
        <p className="text-on-surface-variant font-medium">
          Anda telah menyelesaikan {viewedIds.size} materi. Terus semangat belajar!
        </p>
      </section>

      {/* Overview Cards: Bento Style */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] whisper-shadow group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary-fixed rounded-2xl text-primary">
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
            <span className="text-xs font-semibold font-headline text-primary bg-primary-fixed/50 px-3 py-1 rounded-full uppercase tracking-wider">Aktif</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Kursus Terdaftar</p>
          <h3 className="text-4xl font-headline font-black tracking-tight">{enrollments?.length || 0}</h3>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-[2rem] whisper-shadow group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed rounded-2xl text-secondary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Rata-rata Progres Kursus</p>
          <h3 className="text-4xl font-headline font-black tracking-tight">
            {coursesWithProgress.length ? Math.round(coursesWithProgress.reduce((a, b) => a + b.real_progress, 0) / coursesWithProgress.length) : 0}%
          </h3>
          <div className="mt-4 h-2 w-full bg-surface-container rounded-full overflow-hidden">
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
          <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Rata-rata Nilai Kuis</p>
          <h3 className="text-4xl font-headline font-black tracking-tight">{avgScore}</h3>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Courses */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h4 className="text-2xl font-headline font-black tracking-tight italic text-on-surface">Kursus Berjalan</h4>
                <Link href="/student/courses" className="text-primary text-sm font-bold hover:underline" aria-label="Lihat semua kursus terdaftar">Lihat Semua</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coursesWithProgress.map((enroll: any) => (
                    <Link href={`/student/courses/${enroll.course_id}`} key={enroll.course_id} className="block group focus-visible:ring-2 focus-visible:ring-primary rounded-[2.5rem]">
                      <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden soft-shadow border border-surface-container transition-all hover:translate-y-[-4px] hover:shadow-xl h-full flex flex-col">
                          <div className="h-40 relative overflow-hidden bg-primary-fixed">
                              {enroll.courses?.image_url ? (
                                  <Image
                                      src={enroll.courses.image_url}
                                      alt={`Cover art for ${enroll.courses.title}`}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                      <span className="material-symbols-outlined text-5xl text-primary/30">menu_book</span>
                                  </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-6">
                                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs text-white font-semibold tracking-wider uppercase">
                                      Fase Belajar
                                  </span>
                              </div>
                          </div>
                          <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                              <div>
                                  <h5 className="font-headline font-black text-xl text-on-surface leading-tight mb-2 line-clamp-1">{enroll.courses?.title}</h5>
                                  <p className="text-sm text-on-surface-variant line-clamp-2 font-medium">{enroll.courses?.description}</p>
                              </div>
                              
                              <div className="space-y-3">
                                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                                      <span>Progress</span>
                                      <span className="text-primary">{enroll.real_progress}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                                      <div 
                                          className="h-full bg-primary transition-all duration-1000" 
                                          style={{ width: `${enroll.real_progress}%` }} 
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-10">
            {/* Langkah Selanjutnya */}
            <section className="space-y-6 px-2">
                <h4 className="text-2xl font-headline font-black tracking-tight italic text-on-surface">Langkah Selanjutnya</h4>
                <div className="space-y-4">
                    <Link href="/student/courses" className="block p-5 bg-surface-container-lowest rounded-[1.5rem] flex items-start gap-4 whisper-shadow hover:translate-x-2 transition-transform cursor-pointer border border-surface-container focus-visible:ring-2 focus-visible:ring-primary">
                        <div className="w-12 h-12 shrink-0 bg-tertiary-fixed rounded-2xl flex items-center justify-center text-tertiary">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-on-surface">Lanjutkan Belajar</p>
                            <p className="text-xs text-on-surface-variant font-medium mt-1">{viewedIds.size} materi telah dilihat dari {totalMaterials?.length || 0} total.</p>
                        </div>
                    </Link>

                    <Link href="/student/explore" className="block p-5 bg-surface-container-lowest rounded-[1.5rem] flex items-start gap-4 whisper-shadow hover:translate-x-2 transition-transform cursor-pointer border border-surface-container focus-visible:ring-2 focus-visible:ring-primary">
                        <div className="w-12 h-12 shrink-0 bg-primary-fixed rounded-2xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-on-surface">Cari Course Baru</p>
                            <p className="text-xs text-on-surface-variant font-medium mt-1">Temukan kelas bahasa yang tersedia.</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Nilai Terbaru */}
            <section className="space-y-6 px-2">
                <h4 className="text-2xl font-headline font-black tracking-tight italic text-on-surface">Nilai Terbaru</h4>
                <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden whisper-shadow border border-surface-container">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface text-on-surface-variant font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Kuis</th>
                                <th className="px-6 py-4 text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container font-medium">
                            {submissions?.map((sub: any) => (
                                <tr key={sub.id} className="hover:bg-surface transition-colors">
                                    <td className="px-6 py-4 font-bold text-on-surface truncate max-w-[120px]">{sub.quizzes?.title}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-3 py-1 rounded-full font-black text-xs ${Number(sub.score) >= 75 ? 'bg-secondary-fixed text-secondary' : 'bg-surface-container border text-on-surface'}`}>
                                            {sub.score || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!submissions?.length && (
                                <tr>
                                    <td colSpan={2} className="px-6 py-8 text-center text-on-surface-variant text-sm">Belum ada aktivitas kuis</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {(submissions?.length ?? 0) > 0 && (
                        <div className="p-4 bg-surface text-center border-t border-surface-container mt-auto">
                            <Link href="/student/courses" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline" aria-label="Lihat seluruh riwayat kuis">Lihat Semua Kuis</Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
