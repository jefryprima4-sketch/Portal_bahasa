import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin');

  const { data: courses } = await supabase
    .from('courses')
    // Perbaikan join menggunakan relasi foreign key yang benar
    .select(`*, instructor:users!courses_instructor_id_fkey (name, email)`)
    .order('created_at', { ascending: false });

  const { count: studentCount } = await supabase.from('course_enroll').select('*', { count: 'exact', head: true });
  const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true });
  const { count: materialCount } = await supabase.from('materials').select('*', { count: 'exact', head: true });

  const stats = [
    { label: 'Total Course', value: courses?.length || 0, icon: 'menu_book', color: 'bg-blue-50 text-blue-600' },
    { label: 'Enrolment', value: studentCount || 0, icon: 'people', color: 'bg-green-50 text-green-600' },
    { label: 'Total Quiz', value: quizCount || 0, icon: 'quiz', color: 'bg-purple-50 text-purple-600' },
    { label: 'Materi PDF', value: materialCount || 0, icon: 'description', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight">Kelola Course</h2>
          <p className="text-[var(--on-surface-variant)] mt-1">Pantau dan kelola seluruh kurikulum pembelajaran di platform.</p>
        </div>
        <a href="/admin/courses/create">
          <Button className="shadow-md">
            <span className="material-symbols-outlined text-sm mr-2">add</span>
            Buat Course Baru
          </Button>
        </a>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined filled text-2xl">{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--outline)] mb-0.5">{s.label}</p>
                  <p className="text-2xl font-headline font-extrabold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-[var(--surface-container-low)]/50 border-b border-[var(--outline-variant)]/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary)] text-xl">list_alt</span>
            Daftar Seluruh Course
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {courses && courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-container-low)]">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Informasi Course</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Instructor</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]/30">
                  {courses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-[var(--surface-container-low)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[var(--primary)]">{course.title}</p>
                        <p className="text-xs text-[var(--on-surface-variant)] line-clamp-1 mt-0.5">{course.description || 'Tidak ada deskripsi'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{course.instructor?.name || 'Unknown'}</span>
                          <span className="text-[10px] text-[var(--outline)]">{course.instructor?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a href={`/admin/courses/${course.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Detail & Konten
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--surface-container)] flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-[var(--outline)]">auto_stories</span>
              </div>
              <div>
                <p className="font-bold text-lg">Belum ada course di sistem</p>
                <p className="text-sm text-[var(--on-surface-variant)]">Silakan klik tombol di atas untuk membuat course pertama.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
