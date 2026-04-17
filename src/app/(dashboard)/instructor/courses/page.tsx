import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { deleteCourse } from './actions';

export default async function InstructorCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto font-body">
      {/* Header Management */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Kelola Kursus</h2>
          <p className="text-on-surface-variant font-medium">Atur materi, kelola kuis, dan pantau hasil belajar mahasiswa Anda.</p>
        </div>
        <a href="/instructor/courses/create">
            <Button className="h-14 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all font-black text-base">
                <span className="material-symbols-outlined mr-2">add</span>
                Buat Kursus Baru
            </Button>
        </a>
      </section>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses?.map((course: any) => (
          <div key={course.id} className="bg-white rounded-[2.5rem] whisper-shadow border border-slate-50 flex flex-col h-full group transition-all hover:translate-y-[-4px]">
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <div className="flex gap-2">
                  <a href={`/instructor/courses/${course.id}/edit`}>
                    <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-white hover:shadow-md transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </a>
                  <form action={async () => { 'use server'; await deleteCourse(course.id); }}>
                    <button type="submit" className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                  <h3 className="font-headline font-black text-2xl text-slate-800 leading-tight tracking-tight italic">{course.title}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">
                    {course.description || 'Kelola kurikulum penguasaan bahasa di sini. Tambahkan materi dan kuis untuk mahasiswa Anda.'}
                  </p>
              </div>

              <div className="flex flex-col gap-3 pt-8 mt-8 border-t border-slate-50">
                <div className="grid grid-cols-2 gap-3">
                    <a href={`/instructor/courses/${course.id}/materials`} className="w-full">
                        <button className="w-full py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-primary transition-all">
                            Materi
                        </button>
                    </a>
                    <a href={`/instructor/courses/${course.id}/quizzes`} className="w-full">
                        <button className="w-full py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-primary transition-all">
                            Kuis
                        </button>
                    </a>
                </div>
                <a href={`/instructor/courses/${course.id}/submissions`} className="w-full">
                    <button className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all">
                        Monitor Progres & Nilai
                    </button>
                </a>
              </div>
            </div>
          </div>
        ))}

        {!courses?.length && (
          <div className="lg:col-span-3 py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined text-4xl text-slate-200">folder_off</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-headline font-black italic tracking-tighter text-slate-800">Kursus Kosong</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                        Anda belum memiliki kursus yang aktif. Klik tombol "Buat Kursus Baru" untuk memulai.
                    </p>
                </div>
          </div>
        )}
      </div>
    </div>
  );
}
