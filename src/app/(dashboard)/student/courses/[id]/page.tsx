import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { enrollCourse } from '../actions';

const typeIcons: Record<string, string> = { pdf: 'picture_as_pdf', audio: 'headphones', video: 'smart_display' };

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: course } = await supabase.from('courses').select('*, instructor:instructor_id (name, email)').eq('id', id).single();
  if (!course) return <p className="text-center py-20 font-headline font-black text-slate-400 italic text-2xl">Kursus Tidak Ditemukan.</p>;

  const { data: enrollment } = await supabase.from('course_enroll').select('*').eq('course_id', id).eq('student_id', user.id).single();
  const isEnrolled = !!enrollment;

  const { data: materials } = await supabase.from('materials').select('*').eq('course_id', id).order('created_at', { ascending: true });
  const { data: quizzes } = await supabase.from('quizzes').select('*').eq('course_id', id).order('created_at', { ascending: false });

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto font-body">
      {/* Premium Header / Hero */}
      <section className="space-y-6">
        <a href="/student/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Daftar Kursus
        </a>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="w-full lg:w-2/3 space-y-4">
                <h1 className="text-5xl md:text-7xl font-headline font-black text-slate-900 tracking-tighter leading-tight italic">
                    {course.title}
                </h1>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                    {course.description || 'Pelajari kemahiran bahasa dengan kurikulum terstandar dan materi berkualitas tinggi dari instruktur ahli kami.'}
                </p>
                <div className="flex items-center gap-4 pt-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-black text-primary border border-blue-100 shadow-sm">
                        {course.instructor?.name?.charAt(0) || 'I'}
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Dosen</p>
                        <p className="text-sm font-bold text-slate-800">{course.instructor?.name || course.instructor?.email}</p>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                {!isEnrolled ? (
                    <div className="bg-white p-8 rounded-[2.5rem] whisper-shadow border border-slate-50 space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-lg font-headline font-black italic tracking-tight">Mulai Belajar Hari Ini</h4>
                            <p className="text-xs text-slate-500 font-medium">Dapatkan akses penuh ke materi pdf, audio, dan kuis interaktif.</p>
                        </div>
                        <form action={async () => { 'use server'; await enrollCourse(id); }}>
                             <Button size="lg" className="w-full h-16 rounded-2xl text-lg shadow-2xl hover:scale-105 transition-all font-black">
                                <span className="material-symbols-outlined mr-2">person_add</span>
                                Daftar Sekarang
                             </Button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                        <div className="flex justify-between items-center text-blue-200">
                             <span className="text-[10px] font-black uppercase tracking-widest">Akses Terdaftar</span>
                             <span className="material-symbols-outlined">verified</span>
                        </div>
                        <h4 className="text-xl font-headline font-black italic">Akses Terbuka</h4>
                        <p className="text-xs text-blue-100 leading-relaxed font-medium">Selamat belajar! Materi kursus kini sepenuhnya tersedia untuk Anda eksplorasi.</p>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* Content Grid */}
      <section>
        {isEnrolled ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Materials Section */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-headline font-black tracking-tight italic text-slate-800 px-2 flex items-center gap-3">
                         <span className="p-2 bg-blue-50 text-primary rounded-xl material-symbols-outlined">folder_open</span>
                         Materi Pembelajaran
                    </h3>
                    <div className="space-y-4">
                        {materials?.length ? (
                            materials.map((mat: any) => (
                                <a key={mat.id} href={`/student/courses/${id}/materials/${mat.id}`} className="block group">
                                    <div className="p-6 bg-white rounded-[1.5rem] whisper-shadow border border-slate-50 flex items-center gap-5 transition-all group-hover:translate-x-2">
                                        <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-2xl">{typeIcons[mat.type] || 'description'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate tracking-tight">{mat.title}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{mat.skill_category || 'General Skill'}</p>
                                        </div>
                                        <Badge className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-blue-50 text-blue-700 border-none">
                                            {mat.type}
                                        </Badge>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="p-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada materi</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quizzes Section */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-headline font-black tracking-tight italic text-slate-800 px-2 flex items-center gap-3">
                         <span className="p-2 bg-orange-50 text-orange-600 rounded-xl material-symbols-outlined">quiz</span>
                         Kuis & Evaluasi
                    </h3>
                    <div className="space-y-4">
                        {quizzes?.length ? (
                            quizzes.map((quiz: any) => (
                                <a key={quiz.id} href={`/student/quizzes/${quiz.id}`} className="block group">
                                    <div className="p-6 bg-white rounded-[1.5rem] whisper-shadow border border-slate-50 flex items-center gap-5 transition-all group-hover:translate-x-2">
                                        <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-2xl">{quiz.is_listening ? 'headphones' : 'assignment'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate tracking-tight">{quiz.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] bg-slate-50 px-2 py-0.5 rounded-full text-slate-600 font-black uppercase tracking-widest">{quiz.duration} MENIT</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">• Pass: {quiz.passing_grade}%</span>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-orange-500 transition-colors">arrow_forward</span>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="p-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada kuis tersedia</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-slate-50 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined text-4xl text-slate-200">lock</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-headline font-black italic tracking-tighter text-slate-800">Konten Terkunci</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                        Materi dan evaluasi kursus ini hanya tersedia bagi mahasiswa yang telah mendaftar secara aktif.
                    </p>
                </div>
            </div>
        )}
      </section>
    </div>
  );
}
