import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function InstructorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: course } = await supabase.from('courses').select('*').eq('id', id).single();
  if (!course) redirect('/instructor/courses');

  const { count: studentCount } = await supabase.from('course_enroll').select('*', { count: 'exact', head: true }).eq('course_id', id);
  const { count: materialCount } = await supabase.from('materials').select('*', { count: 'exact', head: true }).eq('course_id', id);
  const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('course_id', id);

  const menuItems = [
    { label: 'Kelola Materi', desc: 'Unggah PDF dan Audio pembelajaran', icon: 'folder_open', href: `/instructor/courses/${id}/materials`, color: 'bg-blue-50 text-blue-600' },
    { label: 'Kelola Kuis', desc: 'Buat soal MCQ dan Listening', icon: 'quiz', href: `/instructor/courses/${id}/quizzes`, color: 'bg-purple-50 text-purple-600' },
    { label: 'Nilai & Submisi', desc: 'Pantau hasil kuis mahasiswa', icon: 'assessment', href: `/instructor/courses/${id}/submissions`, color: 'bg-green-50 text-green-600' },
    { label: 'Edit Kursus', desc: 'Ubah judul dan deskripsi kelas', icon: 'edit_note', href: `/instructor/courses/${id}/edit`, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-5xl mx-auto font-body">
      <section className="space-y-1">
        <a href="/instructor/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Daftar Kursus
        </a>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">{course.title}</h2>
        <p className="text-on-surface-variant font-medium max-w-2xl">{course.description || 'Tidak ada deskripsi'}</p>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col items-center justify-center h-36">
          <p className="text-4xl font-headline font-black text-primary tracking-tighter">{studentCount || 0}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Mahasiswa Terdaftar</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col items-center justify-center h-36">
          <p className="text-4xl font-headline font-black text-primary tracking-tighter">{materialCount || 0}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Total Materi</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col items-center justify-center h-36">
          <p className="text-4xl font-headline font-black text-primary tracking-tighter">{quizCount || 0}</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">Total Kuis</p>
        </div>
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <a key={item.href} href={item.href} className="bg-white p-8 rounded-[2rem] whisper-shadow border border-slate-50 group hover:translate-x-2 transition-all flex items-start gap-4">
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${item.color}`}>
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{item.desc}</p>
            </div>
            <span className="material-symbols-outlined text-slate-200 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
          </a>
        ))}
      </div>
    </div>
  );
}
