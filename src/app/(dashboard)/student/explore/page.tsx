import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function StudentExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: allCourses } = await supabase
    .from('courses')
    .select('*, instructor:users!courses_instructor_id_fkey (name, email)')
    .order('created_at', { ascending: false });

  const { data: enrollments } = await supabase
    .from('course_enroll')
    .select('course_id')
    .eq('student_id', user.id);

  const enrolledIds = new Set(enrollments?.map(e => e.course_id) || []);
  const coursesToExplore = allCourses?.filter(c => !enrolledIds.has(c.id)) || [];

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto font-body">
      <section className="space-y-1">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight italic">Eksplorasi Kursus Baru</h2>
        <p className="text-on-surface-variant font-medium">Temukan dan daftar ke berbagai materi pembelajaran bahasa yang dikurasi oleh para dosen profesional.</p>
      </section>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl whisper-shadow border border-slate-50">
        <span className="material-symbols-outlined text-slate-400">search</span>
        <input
          type="text"
          placeholder="Cari judul kursus atau nama dosen..."
          className="bg-transparent border-none focus:ring-0 text-sm flex-1 font-body"
        />
        <Button variant="secondary" size="sm" className="rounded-xl">Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesToExplore.length > 0 ? (
          coursesToExplore.map((course: any) => (
            <div key={course.id} className="bg-white rounded-[2rem] whisper-shadow border border-slate-50 flex flex-col h-full group hover:translate-y-[-4px] transition-all overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-50 transition-colors">
                <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">language</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-xl mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed font-medium">
                    {course.description || 'Tidak ada deskripsi tersedia untuk kursus ini.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Dosen</span>
                    <span className="text-xs font-medium text-slate-700">{course.instructor?.name || 'Tidak diketahui'}</span>
                  </div>
                  <a href={`/student/courses/${course.id}`}>
                    <Button size="sm" className="rounded-xl shadow-md">
                      <span className="material-symbols-outlined text-sm mr-2">login</span>
                      Daftar Sekarang
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] whisper-shadow border border-slate-50">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-200">school</span>
            </div>
            <h4 className="font-headline font-bold text-lg mb-1 text-slate-800">Wah, Kamu Hebat!</h4>
            <p className="text-sm text-slate-500 font-medium">Kamu sudah mendaftar di semua kursus yang tersedia saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
