import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin');

  const { data: course } = await supabase
    .from('courses')
    .select('*, instructor:users!courses_instructor_id_fkey(name, email)')
    .eq('id', id)
    .single();

  if (!course) redirect('/admin/courses');

  const { count: studentCount } = await supabase.from('course_enroll').select('*', { count: 'exact', head: true }).eq('course_id', id);
  const { count: materialCount } = await supabase.from('materials').select('*', { count: 'exact', head: true }).eq('course_id', id);
  const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('course_id', id);

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-5xl mx-auto font-body">
      <section className="space-y-1">
        <a href="/admin/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline group mb-2">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Kembali ke Daftar Kursus
        </a>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">{course.title}</h2>
        <p className="text-on-surface-variant font-medium max-w-2xl">{course.description || 'Tidak ada deskripsi'}</p>
      </section>

      {/* Instructor Info */}
      <div className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dosen Pengampu</p>
            <p className="text-sm font-bold text-slate-800">{course.instructor?.name || 'Belum ditugaskan'}</p>
            {course.instructor?.email && <p className="text-xs text-slate-500">{course.instructor.email}</p>}
          </div>
        </div>
      </div>

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
    </div>
  );
}
