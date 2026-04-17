import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { InstructorAttendanceClient } from './instructor-attendance-client';

async function markAttendance(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const courseId = formData.get('course_id') as string;
  const studentId = formData.get('student_id') as string;
  if (!courseId || !studentId) return;

  // Verify instructor owns this course (or is admin)
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single();
    if (!course || course.instructor_id !== user.id) return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('course_id', courseId)
    .eq('student_id', studentId)
    .gte('timestamp', today.toISOString())
    .maybeSingle();

  if (existing) return;

  await supabase.from('attendance').insert({
    course_id: courseId,
    student_id: studentId,
    method: 'manual',
  });
}

export default async function InstructorAttendancePage() {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .eq('instructor_id', user.id);

  return (
    <InstructorAttendanceClient>
      <div className="p-8 lg:p-12 space-y-10 max-w-7xl mx-auto font-body">
        {/* Header Attendance */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-headline font-black text-on-surface tracking-tighter italic">Pelacakan Kehadiran</h2>
            <p className="text-on-surface-variant font-medium">Monitoring dan kelola kehadiran harian mahasiswa pada setiap mata kuliah.</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-[1.5rem] whisper-shadow flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined font-black">calendar_month</span>
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sesi Hari Ini</p>
                  <p className="text-sm font-bold text-slate-800">
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
              </div>
          </div>
        </section>

        {/* Courses List */}
        <div className="space-y-12">
          {courses && courses.length > 0 ? (
            courses.map((course: any) => (
              <AttendanceCourseSection
                key={course.id}
                courseId={course.id}
                courseTitle={course.title}
                markAttendance={markAttendance}
              />
            ))
          ) : (
            <div className="py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-4xl text-slate-200">qr_code_scanner</span>
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest italic leading-relaxed">
                  Belum ada kursus aktif untuk pelacakan presensi.<br/>Silakan buat kursus baru terlebih dahulu.
              </p>
            </div>
          )}
        </div>
      </div>
    </InstructorAttendanceClient>
  );
}

async function AttendanceCourseSection({
  courseId, courseTitle, markAttendance,
}: {
  courseId: string;
  courseTitle: string;
  markAttendance: (formData: FormData) => Promise<void>;
}) {
  const supabase = await createClient();

  // Enrolled students
  const { data: enrollments } = await supabase
    .from('course_enroll')
    .select('student_id, users (id, name, nim_nip)')
    .eq('course_id', courseId);

  // Today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('student_id')
    .eq('course_id', courseId)
    .gte('timestamp', today.toISOString());

  const presentTodayIds = new Set(todayAttendance?.map((a: any) => a.student_id) || []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
              <h3 className="text-2xl font-headline font-black tracking-tight italic text-slate-800 lowercase">{courseTitle}</h3>
              <span className="px-3 py-1 bg-blue-50 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
                {enrollments?.length || 0} Mahasiswa
              </span>
          </div>
          <div className="flex items-center gap-6">
              <button 
                data-qr-course-id={courseId}
                data-qr-course-title={courseTitle}
                className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all active:scale-95"
              >
                  <span className="material-symbols-outlined text-sm font-black">qr_code</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sesi QR Dinamis</span>
              </button>
              <div className="text-right border-l border-slate-100 pl-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hadir Hari Ini</p>
                  <p className="text-lg font-black text-slate-800 leading-tight">{presentTodayIds.size} <span className="text-slate-300">/</span> {enrollments?.length || 0}</p>
              </div>
          </div>
      </div>


      <div className="bg-white rounded-[2.5rem] overflow-hidden whisper-shadow border border-slate-50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-500">
              <th className="px-8 py-5">Informasi Mahasiswa</th>
              <th className="px-8 py-5">NIM / NIP</th>
              <th className="px-8 py-5 text-right">Kehadiran Harian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {enrollments?.map((enroll: any) => {
              const student = enroll.users;
              const isPresent = presentTodayIds.has(enroll.student_id);
              return (
                <tr key={enroll.student_id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isPresent ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                              {student?.name?.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{student?.name}</span>
                      </div>
                  </td>
                  <td className="px-8 py-5">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{student?.nim_nip}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {isPresent ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest animate-fade-in shadow-sm">
                        <span className="material-symbols-outlined text-sm font-black">check_circle</span>
                        Terverifikasi Hari Ini
                      </div>
                    ) : (
                      <form action={markAttendance}>
                        <input type="hidden" name="course_id" value={courseId} />
                        <input type="hidden" name="student_id" value={enroll.student_id} />
                        <button 
                          type="submit" 
                          className="h-10 px-6 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-primary hover:text-white hover:shadow-xl transition-all rounded-xl border border-transparent shadow-sm"
                        >
                          Tandai Hadir
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {!enrollments?.length && (
            <div className="p-16 text-center text-xs text-slate-300 font-black uppercase tracking-[0.2em] italic">
                Belum ada mahasiswa yang terdaftar di kursus ini.
            </div>
        )}
      </div>
    </section>
  );
}
