import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function StudentCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: enrollments } = await supabase.from('course_enroll').select('*, courses (*)').eq('student_id', user.id);

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto">
      <section className="space-y-1">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Kursus Saya</h2>
        <p className="text-on-surface-variant font-medium">Daftar kursus yang sedang Anda ikuti.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments?.map((enroll: any) => (
          <a key={enroll.course_id} href={`/student/courses/${enroll.course_id}`}
            className="block bg-white rounded-[2rem] whisper-shadow border border-slate-50 p-8 group hover:translate-y-[-4px] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{enroll.courses?.title}</h3>
            <p className="text-sm text-slate-500 font-medium mt-2 line-clamp-2">{enroll.courses?.description || 'Tidak ada deskripsi'}</p>
          </a>
        ))}
      </div>
      {(!enrollments || enrollments.length === 0) && (
        <div className="py-16 text-center bg-white rounded-[2rem] whisper-shadow border border-slate-50">
          <span className="material-symbols-outlined text-4xl text-slate-200 mb-4 block">menu_book</span>
          <p className="text-slate-400 font-medium">Belum ada kursus. <a href="/student/explore" className="text-primary hover:underline font-bold">Cari kursus sekarang</a></p>
        </div>
      )}
    </div>
  );
}
